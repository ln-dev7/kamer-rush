# Contributing to the local prototype

The source is being prepared for a possible public release. The [project license](LICENSING.md) still needs the owner's decision. Until that happens, do not describe this checkout as already licensed open source or assume permission to redistribute it.

## Development workflow

1. Use a separate local branch once working in a Git checkout. Do not overwrite unrelated local work. No remote repository is required to run this prototype.
2. Run `npm ci`, then `npm run dev`. Keep the server on localhost unless the owner deliberately authorizes a different setup.
3. Make one focused change and update the relevant documentation. Read [architecture](docs/architecture.md) before changing state transitions or collisions.
4. Run `npm test`, `npm run build`, and `npm run format:check`. `npm run format` applies the shared formatting.
5. Test the actual browser flow affected by the change. For vehicles, include parking, exit, walking around the model, boarding, pickup/dropoff, pause and retry. For maps, turn through all four directions and verify north and the target against the 3D streets.
6. Describe the concrete problem, resulting behavior, automated checks, manual checks and remaining limits. A screenshot is useful for geometry or HUD changes; it must show this project and contain no private reference images or personal data.

## Code conventions

TypeScript strict mode is enabled. Use metres, seconds and radians. Keep pure rules in `logic.ts`, spatial primitives in `collision.ts`, dimensions in `dimensions.ts`, map data in `map.ts` and model geometry in `world.ts`. The current runtime/UI lives in `main.ts`; extracting cohesive modules is welcome when accompanied by a working end-to-end check.

Use Prettier's defaults via the package scripts. Prefer named imports, explicit units, meaningful state names, accessible button labels and shared dimensions over duplicated magic numbers. Do not add framework layers for small changes. Do not introduce an external asset without a documented license and source. Add tests for behavioral invariants, especially state safety and model/collider scale; avoid tests that merely duplicate rendering statements.

## Scope boundaries

Do not add accounts, payments, servers, tracking, weapons, crime mechanics or multiplayer as incidental changes. Do not publish a repository or deploy from this local workflow. Never commit `.env` files, credentials, browser profiles, personal saves, private reference screenshots or helper transfer manifests. The [release checklist](docs/releasing.md) is preparatory, not authorization to publish.
