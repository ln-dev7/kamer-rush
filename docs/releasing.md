# Preparing a public source release

This is a checklist for a future owner-approved action. No repository has been created or published and no site has been deployed by this task.

- Choose and approve the original-code/content license; add its exact text and copyright holder, update `package.json`, README and [LICENSING.md](../LICENSING.md). Do not infer MIT from dependencies.
- Review [provenance](../THIRD_PARTY.md), the dependency inventory and license files. Confirm every added asset is redistributable under the chosen release terms.
- Keep `reference/` and `.library-transfer/` private and excluded. Do not publish user-provided Moto Wewa/GTA/reference screenshots. Only this project's clean screenshots may illustrate the public docs.
- Inspect the actual staged file list. Exclude secrets, `.env`, credentials, logs, browser profiles, personal saves, `node_modules`, caches and generated `dist`.
- Run `npm ci`, `npm test`, `npm run build` and `npm run format:check` from the intended checkout. Record actual hardware/browser testing and the unresolved coverage gaps.
- Check documentation links and run every example/command you advertise. Keep known limitations separate from future work.
- Choose repository name, owner, visibility, contribution process and support contact with the owner. Creating a GitHub repository, pushing, deploying or selecting paid services requires a separate user instruction.

Generated dialogue MP3s have [separate rights](../public/audio/AUDIO-NOTICE.md). The owner authorized inclusion of the 40 existing dialogue MP3s. Do not automatically apply a code license to recordings; retain their separate notice for redistribution. Geist remains under SIL OFL 1.1.
