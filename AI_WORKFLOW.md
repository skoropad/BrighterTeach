# AI Development Workflow

How this project was built using AI tools in a ~2-3 hour timebox.

## Tools Used

| Tool | Purpose |
|------|---------|
| v0.dev | Initial UI scaffold — generated the base Next.js project with kid-friendly components |
| Cursor (Agent mode) | Feature implementation — state management, API route, chat logic, testing |
| Cursor (Plan mode) | Architecture decisions — documentation structure, image upload design |
| Google Gemini 2.5 Flash | Runtime LLM powering the homework helper |

## Phase 1: UI Scaffold (v0.dev)

**Goal:** Generate a kid-friendly UI shell with proper component structure.

**What v0 generated:**
- Next.js App Router project with Tailwind CSS + shadcn/ui
- Two-panel layout: WorkspaceCard (input) + TutorChat (output)
- Header component with playful branding
- Pastel color scheme, rounded corners, Nunito font
- ~60 shadcn/ui primitives (many unused — v0 includes its full library)

**What needed fixing:**
<!-- Fill in: hardcoded data, missing state, SVG issues, etc. -->

## Phase 2: Core Implementation (Cursor Agent)

**Goal:** Wire up real functionality — state management, AI integration, chat flow.

### State Management & Chat Lock
<!-- Fill in: how you prompted Cursor, what it got right/wrong -->
- Implemented `Session` state model in `page.tsx`
- Wired `useChat` from Vercel AI SDK
- Built chat lock pattern (TutorChat disabled until first submit)
- Added localStorage persistence for messages and session

### API Route & System Prompt
<!-- Fill in: prompt engineering iterations, what you changed -->
- Created `POST /api/chat` route with input validation
- Built `buildSystemPrompt()` with three adaptive dimensions (tone, subject, mode)
- Hint mode uses a strict "do not solve" instruction — required prompt iteration to get right

### Key Iterations
<!-- Fill in with actual examples, e.g.: -->
<!-- - "First attempt at hint mode leaked answers — had to strengthen the system prompt constraint" -->
<!-- - "v0 generated mock data in the chat — had to remove all hardcoded messages" -->
<!-- - "useChat integration needed body parameter for grade/subject/mode metadata" -->

## Phase 3: Testing (Cursor Agent)

**Goal:** Add meaningful tests with Vitest + React Testing Library.

- 6 test files covering unit, component, route, and page levels
- Mocked external dependencies: `@ai-sdk/google`, `@ai-sdk/react`, `react-markdown`, `sonner`
- Added jsdom polyfills for Radix UI pointer capture APIs
- Set up Husky pre-commit hook running the full test suite

### What the AI Got Right
<!-- Fill in: tests that worked on first try -->

### What Needed Manual Fixes
<!-- Fill in: mock setup issues, import problems, etc. -->

## Phase 4: Polish

**Goal:** Documentation, code cleanup, bonus features.

- Created README.md with setup instructions
- Created ARCHITECTURE.md documenting frontend/backend design
- Added image upload support (bonus feature)
- Restructured this document from a kickoff prompt into a process record

## Reflections

### What Worked Well
<!-- Fill in: speed gains, what AI handled best -->

### What Needed Human Judgment
<!-- Fill in: product decisions, prompt engineering, UX choices -->

### Prompt Patterns That Helped
<!-- Fill in: specific prompt strategies, e.g.: -->
<!-- - "Plan mode first, then execute — catching issues before writing code" -->
<!-- - "Providing the full test strategy doc as context when writing tests" -->
