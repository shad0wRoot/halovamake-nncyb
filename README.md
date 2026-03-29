<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

# halovamake-nncyb

Dashboard-first Vue 3 web application for request intake, tracking, and account workflows.

## Highlights

- Vue 3 + TypeScript + Vite application
- Route-driven dashboard layout with persistent sidebar/navigation
- Form-driven create-request flow with schema validation
- Interactive charts and tables
- Component library built on Reka UI primitives and Tailwind CSS

## Tech Stack

- Framework: Vue 3
- Language: TypeScript
- Build tool: Vite
- Routing: Vue Router
- State: Pinia
- Validation: vee-validate + zod
- UI primitives: Reka UI
- Styling: Tailwind CSS v4 + class-variance-authority
- Data table: @tanstack/vue-table
- Charts: @unovis/vue

## Requirements

- Node.js version: ^20.19.0 or >=22.12.0
- Package manager: pnpm

## Quick Start

1. Install dependencies:

	 pnpm install

2. Start development server:

	 pnpm dev

3. Open the local URL shown by Vite (usually http://localhost:5173).

## Available Scripts

- pnpm dev: Start the development server
- pnpm build: Type-check and build production bundle
- pnpm build-only: Build only (without separate type-check step)
- pnpm preview: Preview production build
- pnpm type-check: Run vue-tsc type checks
- pnpm lint: Run configured linters
- pnpm lint:oxlint: Run Oxlint with auto-fix
- pnpm lint:eslint: Run ESLint with auto-fix and cache
- pnpm format: Format source files with Prettier
- pnpm license: Apply REUSE license annotations recursively

## App Structure

- src/pages/dashboard/Layout.vue
	- Dashboard shell with persistent sidebar + routed content area
- src/pages/dashboard/DashboardPage.vue
	- Main dashboard overview page
- src/pages/dashboard/CreatePage.vue
	- Create request form page
- src/pages/dashboard/AppealsPage.vue
	- Appeals page
- src/pages/dashboard/DraftsPage.vue
	- Drafts page
- src/pages/dashboard/NotificationsPage.vue
	- Notifications page
- src/pages/dashboard/SettingsPage.vue
	- Settings page
- src/pages/dashboard/AccountPage.vue
	- Account page
- src/router/index.ts
	- Route definitions and nested dashboard routes
- src/components
	- Shared UI and feature components (sidebar, table, chart, header)

## Routes

Public/Auth routes:

- /login
- /register
- /signup

Dashboard routes (inside shared layout):

- /dashboard
- /appeals
- /drafts
- /create
- /settings
- /account
- /notifications

Fallback route:

- /:pathMatch(.*)* -> Not Found page

## Development Notes

- The dashboard uses nested routing, so navigation updates page content while preserving the sidebar and overall layout.
- Create page uses schema-driven validation. Update both schema and initial values when adding/removing fields.
- If you add a new dashboard section:
	1. Create page component under src/pages/dashboard.
	2. Add route in src/router/index.ts as a child of dashboard layout.
	3. Add nav entry in sidebar components.

## License

This project uses LicenseRef-SSPL-1.0. See LICENSES/LicenseRef-SSPL-1.0.txt.
