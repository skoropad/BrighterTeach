# Testing Strategy

## Stack

- **Runner:** Vitest (jsdom environment)
- **Component testing:** @testing-library/react + @testing-library/user-event
- **Assertions:** Vitest built-ins + @testing-library/jest-dom matchers
- **Path aliases:** vite-tsconfig-paths (reads `@/*` from tsconfig)

## File layout

Tests live in `__tests__/` sibling directories next to the code they test:

```
lib/__tests__/build-system-prompt.test.ts
components/__tests__/header.test.tsx
components/__tests__/workspace-card.test.tsx
components/__tests__/tutor-chat.test.tsx
app/api/chat/__tests__/route.test.ts
app/__tests__/page.test.tsx
```

Config files: `vitest.config.mts`, `test/setup.ts`.

## Test categories

| Category | What | How |
|----------|------|-----|
| Unit | Pure functions (`lib/`) | Direct import, no mocks needed |
| Component | React components | RTL `render` + `screen` + `userEvent` |
| Route | API route validation | Construct `Request`, call exported `POST` directly |
| Page | Full page with hooks | Mock `@ai-sdk/react` (`useChat`), mock `sonner` |

## Mocking rules

- **Never call a real AI API.** Mock the provider module (`@ai-sdk/google`) and `streamText` from `ai`.
- **`useChat`:** Mock `@ai-sdk/react` with `vi.mock` returning a controlled `{ messages, sendMessage, setMessages, status }`.
- **`react-markdown`:** Mock with a passthrough `<p>` tag in component tests that render markdown content.
- **`sonner`:** Mock `toast` in page tests.

## jsdom polyfills

Radix UI uses pointer capture APIs missing from jsdom. These are polyfilled in `test/setup.ts`:
- `Element.prototype.hasPointerCapture`
- `Element.prototype.setPointerCapture`
- `Element.prototype.releasePointerCapture`
- `Element.prototype.scrollIntoView`

## Running tests

```bash
npm test          # single run (used by CI and pre-push hook)
npm run test:watch  # watch mode during development
```

## Git hooks

- **pre-commit:** Runs `npm test` (full suite, ~3s). Blocks commit if tests fail.

## Deferred

- E2E / Playwright
- Coverage tooling
- `MockLanguageModelV4` streaming integration tests (happy-path route test)
