// "module" built-in Node dummy module polyfill
module.exports = {
  createRequire: () => () => {},
  builtinModules: [],
  Module: class Module {
    constructor() {
      this.children = []
      this.exports = {}
      this.filename = ""
      this.id = ""
      this.loaded = false
      this.parent = {}
      this.paths = []
    }
  },
  runMain: () => {},
  wrap: () => {},
  _cache: {},
  _contextLoad: () => {},
  _debug: () => {},
  _extensions: {},
  _findPath: () => {},
  _load: () => {},
  _nodeModulePaths: () => {},
  _pathCache: {},
  _preloadModules: () => {},
  _preserveSymlinks: () => {},
  _resolveFilename: () => {},
  _resolveLookupPaths: () => {},
  _resolveLookupPathsCached: () => {},
  _resolveLookupPathsCachedMemoized: () => {},
  _resolveLookupPathsMemoized: () => {},
  _resolveFilenameMemoized: () => {},
  _resolveFilenameNoCache: () => {},
  _resolveFilenameNoCacheMemoized: () => {},
  _source: "",
  _syncBuiltinESMExports: () => {},
  _tickCallback: () => {},
}
