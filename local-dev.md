# Local Development

Prerequisites:

- Node.js 14+ installed.
- Install [pnpm](https://pnpm.io/installation)
- Install the PlanetScale CLI: https://github.com/planetscale/cli#installation
- Add the `apps/web/.env.local` file with the Clerk, PlanetScale, and LiveBlocks API keys.

Run:

- pnpm dev:all

Push db changes:

- pnpm db:push
