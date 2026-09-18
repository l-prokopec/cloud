# AGENTS.md

## Project overview

Cloud Hopper is a small browser game inspired by Flappy Bird. The player keeps a bird in the air and flies through gaps between obstacles to earn points.

The project intentionally uses plain HTML, CSS, and JavaScript with no framework, package manager, build step, or backend. Keep the application simple, lightweight, responsive, and usable on both mobile and desktop browsers.

### Main files

- `index.html` — page structure and game canvas.
- `style.css` — responsive page and game presentation.
- `game.js` — game loop, physics, input, collision detection, scoring, audio, and canvas rendering.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.

## Run locally

No dependencies or installation are required.

For a quick manual run, open `index.html` in a modern browser.

When an HTTP server is preferable, serve the repository root with any available static server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Do not introduce Node.js, npm, a framework, or a build system unless the feature being implemented clearly requires it.

## Testing

There is currently no automated test suite.

Before committing gameplay changes:

1. Load the game in a modern browser and confirm there are no console errors.
2. Verify starting, flapping, scoring, collision/game-over, and restarting.
3. Verify the high score persists after a page reload.
4. Verify the sound toggle works.
5. Test both pointer/touch input and keyboard input (`Space` and `ArrowUp`).
6. Check the layout at a narrow mobile viewport and a normal desktop viewport.

If automated tests are introduced later, document their exact command in this file and keep them runnable from a clean checkout.

## Code rules

- Preserve the dependency-free architecture unless there is a concrete reason to change it.
- Prefer small, readable changes over unnecessary abstraction.
- Keep gameplay logic in `game.js`, presentation in `style.css`, and document structure in `index.html`.
- Do not add generated files, vendored dependencies, secrets, credentials, or machine-specific files to the repository.
- Maintain mobile-first controls and responsive behavior.
- Keep keyboard controls accessible on desktop.
- Avoid breaking existing saved high scores in `localStorage`; if the storage format must change, provide a safe migration or fallback.
- Keep user-facing text consistent with the existing Czech UI unless the task explicitly changes the language strategy.
- After a change, review the diff and manually test the affected behavior before considering the task complete.
- Update `README.md` or this file when setup, architecture, controls, testing, or deployment behavior changes materially.

## Git and commits

- Make focused commits with concise imperative commit messages.
- Do not rewrite published history unless explicitly requested.
- Avoid unrelated formatting or refactoring in feature/fix commits.
- Never commit secrets or credentials.

## Deployment — GitHub Pages

Production deployment is handled by `.github/workflows/pages.yml`.

The workflow is triggered by pushes to the `master` branch and can also be started manually from GitHub Actions. It checks out the repository, configures GitHub Pages, uploads the static site, and deploys it with the official Pages deployment action.

Repository Pages settings must use **GitHub Actions** as the deployment source.

Normal deployment procedure:

1. Complete and test the change.
2. Commit the change to `master` (or merge the reviewed change into `master`).
3. Let the GitHub Pages workflow run.
4. Confirm the workflow finishes successfully.
5. Verify the deployed game at `https://l-prokopec.github.io/cloud/`.

If deployment fails, inspect the failed GitHub Actions job and its logs before changing application code. Do not make speculative code changes for an infrastructure/configuration failure.
