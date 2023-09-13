# Portal Lang Design

PortalLang is runs on top of JavaScript and React and aims to be a high level language for building web applications that is easy to learn and use. The design choices are based on that goal. It is minimalistic yet powerful and customizable.

Design principles:

- If something feels like it should be simple, it should be simple.
- Programming languages ARE for people PERIOD. At least, high-level languages. We optimize for people, not machines. However, this doesn't mean we don't care about performance. We do. But, we don't sacrifice simplicity for performance.
- Minimalistic language. One or a couple of great way(s) to do something = ✨.Too many ways to do something = 🫠.
- DX over perf. Kind of the same as the one below but we believe in repeating ourselves.
- It should just work. No need to think about it. No need to configure it. No need to install it. No need to import it. It should just work. If it doesn't, it's a bug or a missing feature.

Language features:

- Chained object/list access is always safe. Think of it like if in JavaScript you did `a.b.c.d` but as `a?.b?.c?.d` every time. If any of the objects in the chain are undefined, the result is undefined and no error is thrown. The difference is that with PortalLang this happens under the hood, with no clutter and you don't have to worry about it. No more undefined or null references exceptions! 🎉 Bye "Uncaught TypeError: Cannot read properties of undefined (reading 'x')" 👋.
- Everything looks sync by default even though things are async under the hood. No more `async` or `await` keywords cluttering your code! ✨

## Implementation

Work in progress. Check this folder's code.
