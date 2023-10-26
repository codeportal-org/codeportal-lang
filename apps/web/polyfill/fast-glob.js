module.exports = {
  sync: (patterns) => [].concat(patterns),
  escapePath: (path) => path,
  generateTasks: (patterns) => [
    {
      dynamic: false,
      base: ".",
      negative: [],
      positive: [].concat(patterns),
      patterns: [].concat(patterns),
    },
  ],
}
