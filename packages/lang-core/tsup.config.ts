import { Options, defineConfig } from "tsup"

export default defineConfig((options: Options) => ({
  treeshake: true,
  splitting: true,
  entry: ["src/**/*.tsx", "!src/**/*.stories.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  minify: true,
  clean: true,
  external: ["react"],
  ...options,
}))
