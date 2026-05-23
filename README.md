# Rent vs. Buy Calculator

An interactive financial calculator for comparing the long-term cost of buying a home versus renting and investing the difference.

The app models mortgage amortization, PMI, ownership costs, rent growth, investment returns, inflation-adjusted display values, federal and sample state taxes, mortgage interest deductions, capital gains exclusions, and NIIT. The calculation engine is pure TypeScript and intentionally separate from React, UI state, and data-provider concerns.

## Current Status

Phase 1 is complete:

- Next.js 14 App Router scaffold with TypeScript, Tailwind, shadcn-compatible config, Zustand, Recharts, and Vitest.
- Pure calculation engine in `lib/engine`.
- Data layer scaffolding in `lib/data`, including user providers, 2025 federal tax tables, sample state tax tables, ZIP-to-state stubs, and tax derivation.
- Engine and data-layer unit tests in `tests/engine`.

The visible app shell is intentionally minimal for now. Full state and UI work comes after the tested engine.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui-compatible project structure
- Zustand
- Recharts
- Vitest

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

Run the test suite once:

```bash
npm run test:run
```

Run tests in watch mode:

```bash
npm test
```

Run lint checks:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm start
```

Print the worked Phase 1 example:

```bash
PRINT_WORKED_EXAMPLE=1 npx vitest run tests/engine/worked-example.test.ts --reporter verbose
```

## Project Structure

```text
app/
  layout.tsx
  page.tsx
components/
  inputs/
  results/
  scenario/
  sections/
  ui/
lib/
  data/
    providers/
    tax-tables/
    derive-tax.ts
    zip-to-state.json
  engine/
    amortization.ts
    buyPath.ts
    compare.ts
    index.ts
    inflation.ts
    rentPath.ts
    types.ts
  store/
tests/
  engine/
```

## Architecture

The project is split into three layers:

- `lib/engine`: pure functions for mortgage schedules, buy path, rent path, inflation conversion, and scenario comparison. This layer has no React, Zustand, or UI imports.
- `lib/data`: provider interfaces, user-input provider scaffolding, tax tables, ZIP lookup stubs, and tax derivation.
- `app` and `components`: UI layer. The full interactive UI is planned for the next phase.

## Notes

All user-facing inputs are nominal. Inflation is used for display conversion only. The tax tables are 2025 stubs for v1 and should be updated annually or replaced with fuller data sources later.
