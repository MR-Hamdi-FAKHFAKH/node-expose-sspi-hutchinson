[node-expose-sspi](../README.md) › [Globals](../globals.md) › ["src/sso/interfaces"](../modules/_src_sso_interfaces_.md) › [AuthOptions](_src_sso_interfaces_.authoptions.md)

# Interface: AuthOptions

options to provide to sso.auth() and SSO.setOptions().

**`export`** 

**`interface`** AuthOptions

## Hierarchy

* **AuthOptions**

## Index

### Properties

* [useActiveDirectory](_src_sso_interfaces_.authoptions.md#optional-useactivedirectory)
* [useCookies](_src_sso_interfaces_.authoptions.md#optional-usecookies)
* [useGroups](_src_sso_interfaces_.authoptions.md#optional-usegroups)
* [useOwner](_src_sso_interfaces_.authoptions.md#optional-useowner)

## Properties

### `Optional` useActiveDirectory

• **useActiveDirectory**? : *boolean*

*Defined in [src/sso/interfaces.ts:51](https://github.com/jlguenego/node-expose-sspi/blob/2cf7b18/src/sso/interfaces.ts#L51)*

Brings back the Active Directory user information

Note 1: only if we can reach Active Directory of the Domain Controller

**`default`** true

**`memberof`** AuthOptions

___

### `Optional` useCookies

• **useCookies**? : *boolean*

*Defined in [src/sso/interfaces.ts:75](https://github.com/jlguenego/node-expose-sspi/blob/2cf7b18/src/sso/interfaces.ts#L75)*

Manage authentication with cookie.
Useful for performance when many users try to connect at the same time.

Note: useCookies will be rewritten to false automatically if useActiveDirectory is set to true.
(Because of Windows parallelism issues with COM interfaces. See Issues #4)

**`default`** false

**`memberof`** AuthOptions

___

### `Optional` useGroups

• **useGroups**? : *boolean*

*Defined in [src/sso/interfaces.ts:39](https://github.com/jlguenego/node-expose-sspi/blob/2cf7b18/src/sso/interfaces.ts#L39)*

Brings back the groups the user belongs to.

**`default`** true

**`memberof`** AuthOptions

___

### `Optional` useOwner

• **useOwner**? : *boolean*

*Defined in [src/sso/interfaces.ts:61](https://github.com/jlguenego/node-expose-sspi/blob/2cf7b18/src/sso/interfaces.ts#L61)*

Brings back the server process owner info.

**`default`** false

**`memberof`** AuthOptions