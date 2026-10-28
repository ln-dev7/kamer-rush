# Public source verification

The repository contains the complete prototype source, branding, original screenshots, documentation, lockfile and dependency notices. The original code license is still pending; a public Git repository alone does not make the project open-source licensed.

Generated MP3 recordings are excluded pending confirmation of public redistribution rights. Their files, local catalog and `.env.local` remain available in the existing authorized Mac installation and are ignored by Git. [Optional local setup](audio.md#optional-local-installation) describes how to use independently authorized recordings. Public source mode uses subtitles and synthesized effects without requesting missing MP3s.

## Checked before push

- Exported only the Git index into a clean directory, without ignored files.
- Confirmed no MP3s, local audio catalog or local environment file in that export.
- Clean locked npm install, TypeScript/production build and formatting passed.
- Test suite: 27 portable tests passed, one private-recording test skipped. On the local installation all 28 tests passed, including 40 recording hashes.
- Opened the clean production build in the browser: the game started, subtitles appeared, voice element had no source and no console error/warning was recorded.
- Checked staged text for credential/private-path patterns and reviewed file inclusion. No secrets, private reference screenshots, browser profiles, dependencies or build directory were staged.
- Existing remote was empty before the initial commit; no history was overwritten. Commits use English descriptions without co-author trailers.

This push contains source only: no deployment or visibility change. Before distributing a build publicly, build from a clean clone without the ignored local audio assets. Vite otherwise copies local `public/` files into local `dist/` even if Git ignores them.
