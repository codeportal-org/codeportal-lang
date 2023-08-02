<div align="center">
<img src="./apps/web/public/favicon.png" width="80" title="CodePortal logo">
</div>

<div align="center"><strong>CodePortal (Beta) 🚀</strong></div>
<div align="center">The full-stack programming platform for indie hackers and makers.<br />A place for all your creations. Simple, powerful, and flexible!</div>
<br />
<div align="center">
<a href="https://codeportal.io">Website</a>
<span> · </span>
<a href="https://codeportal.io/discord">Discord</a>
</div>

## Intro

CodePortal is an open-source GUI-based, web-based programming language and platform that tries to remove as much clutter and unnecessary complexity as possible out of programming. A few key features that set it apart from other programming languages and platforms are:

- The editor is heavily focused on developer experience and thought from the ground up to be AI-first.
- It is a full-stack platform, not just a language. It is a complete solution for building web applications and APIs.
- It is a web-based platform, so it is easy to use and accessible from anywhere. It is also easy to share and collaborate with others.
- For the server side, it uses an interpreter which allows for instant deployments and updates. No need to recompile or restart the server, [inspired by Darklang](https://blog.darklang.com/how-dark-deploys-code-in-50ms/).
- It stores code as a graph of nodes and connections in a database, not as text files. This is a more natural medium for code and it is easier to work with. It enables a lot of things that are more difficult or impossible with text files. Also, the code is always modified in this graph format.
- The UI is block-based/node-based, not text-based. This makes it easier to work with and more intuitive.
- Every node or part of the code is addressable by a unique ID (nanoid).

## Why (short form)

There is so much clutter in programming right now. And, I don't want to settle with what exists. I want something that truly sparks joy and that is thought from the ground up to match the experience we expect from our apps today but for our programming tools. I care so much about this that it doesn't matter if we gotta rebuild the whole thing! Lets do it! If you are curious, read the long form of the "why" below. If not, just try the thing! - @carloslfu

## Try the thing!

Go to [codeportal.io](https://codeportal.io), create an account and start using it. It's free to start and then usage based. You can also host it yourself, I will add instructions on how to do that soon. In the meantime, you can check out the code, run it locally, and read how it works below. Also, you can join the [Discord](https://codeportal.io/discord) to get help and chat with other users.

## How does it work?

### The Portal Language or the engine

We call all of the above the engine internally, and it constitutes the Portal Programming language. Its goal is to be independent from the platform an be easily embeddable into other systems and platforms. To recap, the PortalLang or the engine is:

- The Code Tree (CT) format.
- The Storage API.
- The Editor.
- The Runtime.

**The Code Tree (CT)**: Ground zero is forgetting about saving code as text. Instead, we save it as what it really is, structured data. We use call that the Code Tree (CT). This is the representation of the code as a tree of nodes and connections. In text-based programming, this is referred to as the AST (Abstract Syntax Tree), however, since there is no syntax here, that name doesn't fit anymore. The Code Tree is the source of truth. It is the code itself. It is always stored and modified in this format. It is also the format that is used to run the code.

**The Storage API**: This is the layer in charge of querying and mutating the Code Tree. It includes various indexes, and a simple API for the Editor to interact with the Code Tree. For now, it is a simple in-memory storage, that we persist as blobs but we will be evolving it as we see fit, maybe into a fully fledged DB, or we will using and existing one, 🤔 open for discussion.

**The Editor**: It allows you to explore, understand and modify the Code Tree. This where a lot of the magic happens. It is an extensible UI that benefits from the Code Tree graph format and the Storage API to give the best DX possible. It also integrates with the Runtime to provide debugging features.

**The Runtime**: It an the interpreter and debugger that runs the Code Tree. In the future we would love explore compilation (staring at you WASM 👀) for certain parts but for now it is fully interpreted.

### The Platform (CodePortal)

The platform is our PaaS offering of the Portal Language. Its main parts are:

- **The web app:** You can find it inside the `apps/web` folder. It has the API, web UI and handles auth, billing, DB connections, etc. It is a Next.js app hosted on Vercel.
- **The worker:** It is in charge of long running tasks (background jobs) both internal and the ones that users create. It is a Node.js app.

## Why (long form)

I have wanted to code in a better way for a while. A way that removed all the clutter from programming and let me flow and just create stuff. I tried all kinds of things, many programming paradigms, lots of editors, lots of programming languages, even no-code and low-code tools but those are limiting and you sacrifice power and flexibility. I rather code things most of the time, however those have their place and I use them when it makes sense.

I never found a good answer! Maybe, I am too picky or too demanding, some people say so! haha! 😅 Also, most approaches and efforts that attempted to radically improve programming have failed or died - I keep a list of them. Some still exist, but they have not gained enough adoption, or they are thriving in a niche. BTW, thriving in a niche is great! It is a good use case for those tools. There are structured editors like Scratch and Snap but they are mostly for education and/or niche applications not for general purpose stuff.

I have learned from all these efforts, from the mistakes, and from the good things. So I set out to create a new programming language. I decided to start from first principles and design something simple, smooth, and with a focus on developer experience. Something that is easy to use and flexible enough to create any type of application without sacrificing power, and flexibility. That is CodePortal! I would not call it no-code because it **IS** code, also is not low-code, because it very close to it. So, I think a proper name for it is **new-code**. It is a new way to code. I borrowed this from the SQL -> NoSQL -> NewSQL evolution and I think it fits well its purpose.

- @carloslfu
