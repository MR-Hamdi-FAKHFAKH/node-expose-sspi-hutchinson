if (require("os").platform() !== "win32") {
  throw new Error(
    "The module 'node-expose-sspi' can only work on Microsoft Windows platform."
  );
}

const createError = require("http-errors");
const { decode, encode } = require("base64-arraybuffer");
const sspi = require("bindings")("sspi");

const { printHexDump, trace } = require("./misc/misc");

module.exports = sspi;

sspi.ssoAuth = () => {
  const { credential, tsExpiry } = sspi.AcquireCredentialsHandle("Negotiate");

  // serverContextHandle seems to be useful only for NTLM, not Kerberos.
  // because Kerberos will not request many times the client to complete the SSO Authentication.
  let serverContextHandle;

  return (req, res, next) => {
    const auth = req.get("authorization");
    if (!auth) {
      serverContextHandle = undefined;
      return res
        .status(401)
        .set("WWW-Authenticate", "Negotiate")
        .end();
    }

    if (!auth.startsWith("Negotiate ")) {
      return next(createError(400, `Malformed authentication token ${auth}`));
    }

    req.auth = req.auth || {};
    req.auth.token = auth.substring("Negotiate ".length);
    const protocol = req.auth.token.startsWith("YII") ? "Kerberos" : "NTLM";
    trace("SPNEGO token: " + protocol);
    const buffer = decode(req.auth.token);

    const input = {
      credential,
      clientSecurityContext: {
        SecBufferDesc: {
          ulVersion: 0,
          buffers: [buffer]
        }
      }
    };
    if (serverContextHandle) {
      input.serverContextHandle = serverContextHandle;
    }
    const serverSecurityContext = sspi.AcceptSecurityContext(input);
    serverContextHandle = serverSecurityContext.serverContextHandle;

    trace(printHexDump(serverSecurityContext.SecBufferDesc.buffers[0]));

    if (serverSecurityContext.SECURITY_STATUS === "SEC_I_CONTINUE_NEEDED") {
      return res
        .status(401)
        .set(
          "WWW-Authenticate",
          "Negotiate " + encode(serverSecurityContext.SecBufferDesc.buffers[0])
        )
        .end();
    }

    if (serverSecurityContext.SECURITY_STATUS === "SEC_E_OK") {
      res.set(
        "WWW-Authenticate",
        "Negotiate " + encode(serverSecurityContext.SecBufferDesc.buffers[0])
      );

      const names = sspi.QueryContextAttributes(
        serverContextHandle,
        "SECPKG_ATTR_NAMES"
      );
      const [domain, name] = names.sUserName.split("\\");
      req.user = { domain, name };

      // impersonate to retrieve the userToken.
      sspi.ImpersonateSecurityContext(serverContextHandle);
      trace("impersonate security context ok");
      const userToken = sspi.OpenThreadToken();
      trace("userToken: ", userToken);
      sspi.RevertSecurityContext(serverContextHandle);

      const groups = sspi.GetTokenInformation(userToken, "TokenGroups");
      trace("groups: ", groups);
      req.user.groups = groups;

      // free the userToken
      sspi.CloseHandle(userToken);

      const { sid } = sspi.LookupAccountName(names.sUserName);
      req.user.sid = sid;

      // owner info.
      

      const owner = sspi.GetUserName();
      trace("owner: ", owner);
      req.owner = { name: owner };

      const processToken = sspi.OpenProcessToken();
      const ownerGroups = sspi.GetTokenInformation(processToken, "TokenGroups");
      trace("ownerGroups: ", ownerGroups);
      req.owner.groups = ownerGroups;
      sspi.CloseHandle(processToken);
      
      try {
        const { sid, domain } = sspi.LookupAccountName(owner);
        req.owner.sid = sid;
        req.owner.domain = domain;
      } catch (e) {}

      serverContextHandle = undefined;
    }

    next();
  };
};
