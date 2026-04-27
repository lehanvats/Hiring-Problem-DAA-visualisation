# Hiring Problem DAA Visualization

An interactive React + Vite website that visualizes the classic randomized hiring problem (also known as the secretary problem) using the $1/e$ strategy.

The app provides a full guided walkthrough, editable simulation parameters, and experiment mode for empirical validation.

## Features

- Animated step-by-step simulation of the hiring process.
- Classic randomized strategy with auto threshold $r = \lfloor n/e \rfloor$.
- Manual threshold override for exploration and comparison.
- Seeded randomness for reproducible runs.
- Guided walkthrough panel that explains each phase in context.
- Experiment mode that runs many trials and compares measured success rate vs theoretical $1/e$.
- Formal, polished UI built with Tailwind and shadcn-style component patterns.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Radix UI primitives with shadcn-style components
- Vitest for unit testing

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL shown in terminal (typically `http://localhost:5173`).

## Scripts

- `npm run dev` - start development server.
- `npm run build` - type-check and create production build.
- `npm run preview` - preview production build locally.
- `npm run lint` - run ESLint.
- `npm run test` - run unit tests once.
- `npm run test:watch` - run tests in watch mode.

## How To Use

1. Set candidate count and threshold mode in the parameter panel.
2. Use play controls to animate interviews.
3. Observe sampling and selection phases in the timeline.
4. Read the synchronized walkthrough explanations.
5. Run experiment mode with multiple trials to compare empirical success to $1/e$.

## Notes

- This version is desktop-first.
- Persistence/export and additional algorithm variants are intentionally out of scope for this release.
