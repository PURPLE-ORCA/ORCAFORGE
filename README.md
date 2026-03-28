# OrcaForge

OrcaForge is a highly opinionated, cross-stack development vault. It is built to eliminate boilerplate, enforce strict type-safety, and provide an AI agent with the exact context needed to scaffold React, Next.js, Expo, and Laravel applications without hallucinating.

## 🏗️ Architecture

This repository is split into two distinct ecosystems. **Do not mix them.**

### 1. `packages/` (Compiled Workspaces)
These are standard Bun/NPM workspaces. They contain pure, dependency-free (or strictly peer-dependent) logic that is compiled and linked directly into your projects via package.json (`"@orcaforge/react": "workspace:*"`).

*   **`@orcaforge/core`**: Pure TypeScript utilities (e.g., string manipulation, WebP image conversion). Zero React/Framework overhead.
*   **`@orcaforge/react`**: Agnostic React hooks and components (e.g., `useIsClient`, `useFormImages`).
*   **`@orcaforge/next`**: Next.js App Router specific providers and hooks (e.g., dynamic Breadcrumbs, Route Interceptors).
*   **`@orcaforge/expo`**: Mobile-specific primitives built on native dependencies (e.g., `SafeScreen` with native keyboard controllers).
*   **`@orcaforge/laravel`**: PHP backend traits (e.g., `ApiResponder`, `InertiaResponder`, `Filterable` Eloquent scopes).

### 2. `.forge/recipes/` (The Blueprint Vault)
This is the meta-directory. **These are not packages.** They are uncompiled, highly opinionated reference blueprints. They contain code that relies on project-specific setups (like shadcn/ui, Convex, or specific routing dictionaries) and cannot be abstracted into a generic NPM package. 

*   **`convex/`**: Providers, uploaders, and auth hooks strictly typed for Convex databases.
*   **`expo/`**: Strict `expo-router` dictionaries and navigation wrappers.
*   **`i18n/`**: Reactive `useSyncExternalStore` hooks for external localization libraries.
*   **`ui/`**: Advanced UI patterns (e.g., `LocalizedInput`) that depend on Tailwind and local UI components.

---

## 🤖 Agent Instructions (READ FIRST)

If you are an AI agent operating within this workspace or scaffolding a new project based on this vault, you must adhere strictly to these rules:

1.  **Do not invent boilerplate:** Before writing a utility function, custom hook, or UI wrapper, check if it exists in `packages/` or `.forge/recipes/`.
2.  **Usage Manuals:** Almost every file in `.forge/recipes/` and complex hooks in `packages/` contain a `/* HOW TO USE */` block at the bottom. **Read it** before attempting to implement the code. It dictates the exact required markup and context.
3.  **Implementation Strategy:** 
    *   If you need a generic tool (like formatting initials), import it from `@orcaforge/core`.
    *   If you need a domain-specific setup (like setting up a Convex provider), **copy** the recipe from `.forge/recipes/` into the target project's local `src/` directory. Do not attempt to import from `.forge/`.
4.  **No JSDoc on Implementation:** Keep JSDoc strictly for TypeScript interfaces to preserve IDE IntelliSense. Use block comments at the bottom of the file for extensive usage documentation.
5.  **Strict Typing:** Never use `any`. Never guess string interpolation for routes if a dictionary exists.

## 🚀 Getting Started (Monorepo Setup)

Ensure you have [Bun](https://bun.sh/) installed.

```bash
# Install all workspace dependencies
bun install

# Verify formatting and linting
bun run lint