// Polyfill for Tailwind compiler in browser -------------------------------------------------------
const path = require("path")
const moduleFallback = {
  colorette: path.resolve(__dirname, "./polyfill/colorette.js"),
  fs: path.resolve(__dirname, "./polyfill/fs.js"),
  "is-glob": path.resolve(__dirname, "./polyfill/is-glob.js"),
  "glob-parent": path.resolve(__dirname, "./polyfill/glob-parent.js"),
  "fast-glob": path.resolve(__dirname, "./polyfill/fast-glob.js"),
  module: path.resolve(__dirname, "./polyfill/module.js"),
  v8: path.resolve(__dirname, "./polyfill/v8.js"),
  perf_hooks: path.resolve(__dirname, "./polyfill/perf_hooks.js"),
}

const externals = {
  "fs-extra": "self.fsextra",
  resolve: "self.resolve",
  "fs.realpath": "self.fsrealpath",
  purgecss: "self.purgecss",
  chokidar: "self.chokidar",
  tmp: "self.tmp",
  "vscode-emmet-helper-bundled": "null",
}

function getExternal({ context, request }, callback) {
  if (/node_modules/.test(context) && externals[request]) {
    return callback(null, externals[request])
  }
  callback()
}
// ----

module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/fdZmGHyxRj",
        permanent: true,
      },
    ]
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = { ...config.resolve.alias, ...moduleFallback }

    // Polyfill for Tailwind compiler in browser
    if (!isServer) {
      config.resolve.fallback = moduleFallback
      if (config.externals) {
        config.externals.push(getExternal)
      } else {
        config.externals = [getExternal]
      }
    }
    return config
  },
}
