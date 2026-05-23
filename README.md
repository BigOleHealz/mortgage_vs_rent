# Rent vs. Buy Calculator

An interactive financial calculator for comparing the long-term cost of buying a home versus renting and investing the difference.

The app models mortgage amortization, PMI, ownership costs, rent growth, investment returns, inflation-adjusted display values, federal and sample state taxes, mortgage interest deductions, capital gains exclusions, and NIIT. The calculation engine is pure TypeScript and intentionally separate from React, UI state, and data-provider concerns.

## Current Status

The app is now interactive:

- Scenario A and Scenario B comparison mode.
- Save, load, duplicate, and delete named scenarios in your browser.
- Dark/light theme toggle.
- Nominal and inflation-adjusted result views.
- Interactive inputs, headline results, net worth chart, and year-by-year output.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui-compatible project structure
- Zustand
- Recharts
- Vitest

## How To Run This App Locally

These steps are written for someone who is comfortable following instructions, but does not need to know how the code works.

### 1. Install Node.js

Go to [https://nodejs.org](https://nodejs.org) and install the **LTS** version.

After installing it, open a terminal and check that it worked:

```bash
node --version
```

You should see a version number, like `v20.x.x` or newer.

### 2. Open The Project Folder

Open a terminal, then move into this project folder. For example:

```bash
cd /path/to/rent_vs_mortgage_project
```

If the project is on your Desktop, the command might look something like this:

```bash
cd ~/Desktop/rent_vs_mortgage_project
```

### 3. Install The App's Packages

Run this once after downloading the project:

```bash
npm install
```

This may take a minute. It creates a `node_modules` folder with everything the app needs.

### 4. Start The App

```bash
npm run dev
```

When it is ready, the terminal should show a local website address. Usually it is:

[http://localhost:3000](http://localhost:3000)

Open that address in your browser.

### 5. Stop The App

When you are done, go back to the terminal and press:

```text
Control + C
```

On a Mac keyboard, this means holding the `control` key and pressing `c`.

## Troubleshooting

If `npm run dev` says port `3000` is already in use, the app may already be running. Try opening [http://localhost:3000](http://localhost:3000) first.

If the page looks broken after code changes, stop the app with `Control + C`, then run:

```bash
rm -rf .next
npm run dev
```

If `npm install` fails, make sure Node.js LTS is installed and try again.

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
- `app` and `components`: UI layer for inputs, saved scenarios, compare mode, charts, tables, and theme/display toggles.

## Notes

All user-facing inputs are nominal. Inflation is used for display conversion only. The tax tables are 2025 stubs for v1 and should be updated annually or replaced with fuller data sources later.
