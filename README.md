# BrighterTeach AI Homework Helper

A web app where kids (grades 1-8) can get AI-powered help with math and reading homework. Built with Next.js and Google Gemini, the tutor adapts its language and tone to the child's grade level and offers two modes: step-by-step explanations and progressive hints that guide without giving away the answer.

## Features

- **Grade-adaptive tutoring** — responses are tailored to the student's grade across 4 tiers: grades 1-2 (very young), 3-4 (young), 5-6 (upper-elementary), 7-8 (middle-school).
- **Math & reading comprehension** — supports two subjects with distinct prompt strategies: structured step-by-step math breakdowns and reading comprehension focused on context clues and main ideas.
- **Explain vs. hint modes** — "Explain Step-by-Step" walks through the full solution. "Give me a Hint" follows a strict rule: one small conceptual nudge per turn, progressively more specific across follow-ups, never the answer.
- **Image upload** — attach a photo of the homework at any point in the conversation (initial question or follow-ups).
- **Streaming responses** — answers appear in real-time as the model generates them, keeping kids engaged.
- **Chat history persistence** — conversations and session state survive page reloads via `localStorage`.
- **Kid-friendly UI** — soft pastel palette, rounded corners, playful typography (Nunito), and large touch targets designed for children.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| AI | Vercel AI SDK, Google Gemini 2.5 Flash |
| Testing | Vitest, React Testing Library |
| Quality | ESLint, Husky (pre-commit hooks), lint-staged |

## Quick Start

```bash
git clone https://github.com/skoropad/BrighterTeach.git
cd BrighterTeach
npm install
```

Copy the example env file and add your Google AI API key:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run tests (single run) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |

## Project Structure

```
app/
├── api/chat/
│   ├── route.ts              # POST /api/chat — streaming AI endpoint
│   └── __tests__/route.test.ts
├── page.tsx                   # Main page — state, useChat, layout
├── layout.tsx                 # Root layout — font, metadata, Toaster
└── __tests__/page.test.tsx
components/
├── workspace-card.tsx         # Left panel — grade, subject, question input
├── tutor-chat.tsx             # Right panel — message list, follow-up input with image upload
├── header.tsx                 # App header with "Start New Session" button
├── __tests__/                 # Component tests
└── ui/                        # shadcn/ui primitives (button, card, input, textarea, select)
lib/
├── build-system-prompt.ts     # Dynamic system prompt construction
├── constants.ts               # Shared types and config
└── __tests__/
test/
└── setup.ts                   # Vitest setup — jsdom polyfills
```

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — data flow, frontend/backend design, key decisions
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) — test categories, mocking patterns, CI setup
