// Single source of truth for the visible "App build" label and the service-worker cache name.
// Loaded as a module side-effect by h2c-shell.js and via importScripts() from sw.js.
var H2C_APP_BUILD = 'v68';
var H2C_SHELL_CACHE = 'apollo-rca-shell-' + H2C_APP_BUILD;
if (typeof globalThis !== 'undefined') {
  globalThis.H2C_APP_BUILD = H2C_APP_BUILD;
  globalThis.H2C_SHELL_CACHE = H2C_SHELL_CACHE;
}
if (typeof self !== 'undefined') {
  self.H2C_APP_BUILD = H2C_APP_BUILD;
  self.H2C_SHELL_CACHE = H2C_SHELL_CACHE;
}
