# SonarQube fixes for PR #1121

Date: 2026-06-30
Branch: `feat/markdown-it-attrs-v5-compat`

## Issues addressed

- `typescript:S3776`: reduced `resolveFenceLanguageRule` cognitive complexity by extracting fence-info parsing and joining helpers.
- `typescript:S3358`: removed the nested ternary from separator computation by extracting `infoSeparator(rest)` with explicit `if` branches.

## Files changed

- `src/index.ts`
  - `resolveFenceLanguageRule` now only loops over tokens, checks `token.type === 'fence'`, delegates to `resolveFenceInfo(...)`, and applies a returned update.
  - `resolveFenceInfo(...)` preserves existing unescape/trim, first-token split, brace-prefixed attribute-only detection, and `selectLanguage(...)` behavior.
  - `joinResolvedInfo(...)` returns `undefined` when no `token.info` rewrite is needed.
  - `infoSeparator(...)` preserves the original separator rules without a nested ternary.
- `tsconfig.json`
  - After rebasing onto the updated remote branch, TypeScript v6 failed before running tests because `moduleResolution: "bundler"` was paired with `module: "commonjs"`.
  - Restored Node/CommonJS module resolution to match the existing `markdown-it` import style and make the rebased branch testable.

## Verification

Command: `pnpm test`

Result: passed

Note: `pnpm test` was run once before rebasing and once again after rebasing onto the updated remote branch and fixing the TypeScript v6 config issue. The final post-rebase run passed.

```text
> markdown-it-prism@ test /home/josh/Projekte/markdown-it-prism
> npm-run-all lint:* unittest

> markdown-it-prism@ lint:types /home/josh/Projekte/markdown-it-prism
> tsc

> markdown-it-prism@ lint:style /home/josh/Projekte/markdown-it-prism
> eslint .

> markdown-it-prism@ unittest /home/josh/Projekte/markdown-it-prism
> jest

Test Suites: 3 passed, 3 total
Tests:       34 passed, 34 total
Snapshots:   0 total
```

Additional note: LSP diagnostics could not run because `typescript-language-server` is not installed in the environment. The requested `pnpm test` did run `tsc`, ESLint, and Jest successfully.
