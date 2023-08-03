const sharedConfig = require("@codeportal/tailwind-config/tailwind.config.js")

module.exports = {
  // prefix portal-lang lib classes to avoid conflicting with the app
  prefix: "pl-",
  presets: [sharedConfig],
  content: ["./src/**/*.tsx", "./src/**/*.ts"],
}
