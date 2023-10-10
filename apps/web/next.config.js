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
  webpack: (config, options) => {
    config.resolve.fallback = {
      fs: false,
    }

    return config
  },
}
