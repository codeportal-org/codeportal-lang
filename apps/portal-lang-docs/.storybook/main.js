const path = require("path")

module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.tsx",
    "../../../packages/portal-lang/**/*.stories.mdx",
    "../../../packages/portal-lang/**/*.stories.tsx",
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-vite",
  },
  async viteFinal(config, { configType }) {
    // customize the Vite config here
    return {
      ...config,
      resolve: {
        alias: [
          {
            find: "@codeportal/portal-lang",
            replacement: path.resolve(__dirname, "../../../packages/portal-lang/"),
          },
        ],
      },
    }
  },
}
