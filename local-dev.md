# Local Development

Prerequisites:

- Node.js 14+ installed.
- Install [pnpm](https://pnpm.io/installation)
- Install the PlanetScale CLI: https://github.com/planetscale/cli#installation
- Add the `apps/web/.env.local` file with the Clerk, PlanetScale API keys.

Run:

- pnpm dev:web

Run web tests:

- pnpm web:test

Push db changes:

- pnpm db:push

## .test domain for local development

To use a `.test` domain, you need Puma dev installed: https://github.com/puma/puma-dev. This allows you to have SSL locally.
