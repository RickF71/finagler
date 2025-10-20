```instructions
## Quick orientation for AI coding agents (Finagler)

Finagler is a React + Vite frontend dashboard for the DIS-CORE project. These notes are focused and practical: where to look, how to run common flows, repository-specific conventions, and integration points with `dis-core`.

Key files and entrypoints
- `package.json` — scripts for dev, build and lint; Node v22+ recommended.
- `vite.config.js` — Vite entry and dev server options; relevant when adding plugins or changing env handling.
- `index.html` and `public/` — static assets and the HTML entry template.
- `src/main.jsx` — app bootstrap (React root, global styles).
- `src/lib/api.js` — central API client used by views; modify it when changing backend endpoints or auth flows.
- `src/components/*` and `src/views/*` — where UI components and pages live. Examples: `Header.jsx`, `Sidebar.jsx`, `IdentityList.jsx`.

Developer workflows (commands you can run)
- Install deps: `npm install`
- Run dev server: `npm run dev` (uses Vite; hot reload enabled)
- Build production bundle: `npm run build`
- Preview built site: `npm run preview` (Vite preview)
- Linting / formatting: check `package.json` for `lint` / `format` scripts (project uses eslint/postcss/tailwind)

Integration points & environment
- Finagler is a UI that talks to a DIS-CORE backend. The default backend URL is configured in `src/lib/api.js`; update there or inject at runtime via env vars (Vite uses `import.meta.env` — check `vite.config.js`).
- When developing locally, run `dis-core` separately (see the `dis-core` repo). Example: `DIS_DB_DSN="postgres://..." go run cmd/dis-core/main.go --schemas=schemas --domains=domains` to start the backend used by the UI.

Project-specific conventions and patterns
- Single-page React app using Vite with Tailwind CSS. Styles are applied via `index.css` / `App.css` and Tailwind utility classes.
- API wrapper: `src/lib/api.js` centralizes fetch/axios usage — prefer adding endpoints there instead of sprinkling fetch calls across components.
- UI composition: `views/*` are top-level pages that import smaller components from `components/`.
- Assets: images and static files live in `public/` and are referenced directly from `index.html` or via Vite's asset handling in source files.

Where to look for common edits
- Add a new route/page: update `src/main.jsx` (router mount) and create a `src/views/<Name>.jsx` and related components in `src/components/`.
- Add a new backend call: extend `src/lib/api.js`, then call from the view and handle loading / error states using existing patterns (see `IdentityList.jsx` for example).
- Change global styling or Tailwind config: edit `tailwind.config.js` and `index.css` / `App.css` to keep consistency with existing utility classes.

Small safety notes for automated edits
- Avoid changing API contract assumptions in `src/lib/api.js` (paths and response shapes) without updating callers in `src/views/`.
- Keep Vite env variable usage (`import.meta.env.VITE_*`) when adding config options — tests and build rely on that pattern.
- When adding new dependencies, update `package.json` and prefer lightweight, well-maintained packages; run `npm install` and `npm run build` locally to verify no bundling issues.

Examples from the codebase
- Boot pattern: `src/main.jsx` mounts the app and imports `index.css` — modify here when changing global providers (state, i18n, error boundaries).
- API pattern: `src/lib/api.js` exports functions used throughout `views/` (search for `api.` usages to see all endpoints).

Notes on dis-core integration
- Finagler is intentionally thin: it expects a running `dis-core` server for domain data and receipts. When changing data shapes in `dis-core`, update `src/lib/api.js` and any components that consume those shapes.
- For backend changes, consult `dis-core/.github/copilot-instructions.md` for server-specific patterns (schema loading, receipt formats, DB expectations).

If anything is unclear or you need deeper guidance (for example: routing structure, API shapes, or dev env vars), tell me which file or feature you'd like expanded and I'll update this doc.

``` 
