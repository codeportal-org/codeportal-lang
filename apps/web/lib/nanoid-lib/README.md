# Nano ID

This is an internal clone of [nanoid](https://github.com/ai/nanoid) while the Node has better support for ESM modules. Since the original package stopped supporting them it cannot run inside our tests without a hacky way. Relevant issues:

- Nanoid: https://github.com/ai/nanoid/issues/365
- Jest: https://github.com/jestjs/jest/issues/9430

In the meantime I copy pasted the necessary code as a temporary solution.
