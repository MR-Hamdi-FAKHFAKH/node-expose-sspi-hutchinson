#pragma once

#include <memory>
#include <stdexcept>
#include <string>

namespace plf {
// polyfills
std::string string_format(const std::string fmt_str, ...);
}  // namespace plf
