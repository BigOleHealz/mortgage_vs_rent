# Rent vs. Buy Calculator — Project Plan

## Goal

Build an interactive web app that compares the total cost of homeownership against renting over a 40-year horizon, accounting for opportunity cost, taxes, inflation, and mortgage prepayments. Users adjust every assumption via a polished GUI. Calculation inputs are architected for later replacement with real aggregated data (Zillow, FRED, Census, state tax tables) without rewriting the engine.

## Non-Goals (v1)

- Real data integration (ZIP-based lookups are stubbed; architecture supports swap)
- User accounts, cloud sync, multi-device
- Mobile-first design (desktop-first, responsive down to tablet)
- Saving scenarios across sessions beyond localStorage
- Mortgage refinancing modeling
- Rental income / investment property analysis

## Tech Stack

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State:** Zustand (one store per scenario, two scenarios for compare mode)
- **Charts:** Recharts
- **Math:** Pure TypeScript engine, zero React dependencies, fully unit-tested
- **Testing:** Vitest for the engine, Playwright optional for end-to-end
- **Deploy target:** Vercel (or any static-friendly host; no backend in v1)

## Architecture

The system has three layers with strict separation:

**1. Calculation engine (`/lib/engine/`)** — Pure functions. Takes a `ScenarioInputs` object, returns a `ScenarioResults` object containing year-by-year arrays for buy path, rent+invest path, and the net-position delta. Zero awareness of UI, React, or data sources. This is the swapability seam: a future Zillow integration just populates `ScenarioInputs` differently.

**2. Data layer (`/lib/data/`)** — Each input field is sourced from a `DataProvider`. For v1, every provider is `UserInputProvider` (reads from store). The interface is:

```ts
interface DataProvider<T> {
  source: 'user' | 'zillow' | 'fred' | 'census' | 'tax-table';
  get(context: LookupContext): T;
  isOverridden: boolean;
  override(value: T): void;
}
```

A future ZIP lookup just swaps `UserInputProvider` for `ZillowRentProvider` — the engine doesn't change.

**3. UI layer (`/app/`, `/components/`)** — Renders inputs, calls the engine on input change (debounced), displays results. Has no business logic beyond formatting.

## Calculation Model

**Time steps:** Annual, 40-year horizon. All flows aggregated to year-end.

**Inflation:** All user-facing inputs are nominal (mortgage rate, expected stock return, rent growth, home appreciation, etc.). A single inflation rate input drives a display toggle between nominal and real (inflation-adjusted) dollars. The engine computes both and the UI picks which to display.

**Buy path year-by-year computation:**

- Closing costs (% of home price) paid in year 0
- Down payment paid in year 0 (or full purchase price if all-cash)
- Mortgage amortization: principal + interest, with support for extra monthly payments and lump-sum payments at specified years
- PMI: applied when LTV > 80%, drops off when LTV reaches 78% (per standard rules)
- Property tax: % of current home value (grows with appreciation)
- Insurance: % of current home value, with separate growth rate
- HOA: dollar amount with separate growth rate
- Maintenance: % of home value OR dollar override, with separate growth rate
- Mortgage interest deduction: compared against standard deduction for the user's filing status; only the excess is a tax benefit, multiplied by marginal federal rate (+ state if state allows)
- Home value: appreciates at user-set rate annually
- Sale at year N: home value − remaining mortgage − selling costs (% of sale price, default 6-8%) − capital gains tax on gain above $250K/$500K exclusion (single/married)

**Rent + invest path year-by-year computation:**

- Rent paid annually, grows at user-set rate
- Renter's insurance (small, but included)
- "Invested difference" each year: (buyer's total annual outflow − renter's total annual outflow). If positive, renter invests the difference. If negative (renter pays more than buyer in a given year), renter withdraws from portfolio.
- Initial investment: down payment + closing costs that buyer paid in year 0
- Portfolio grows at user-set expected return
- Annual drag: dividend tax + rebalancing capital gains (simplified as a "tax drag %" applied to portfolio value annually)
- At year N: portfolio value − capital gains tax on total realized gains (long-term rate based on income bracket, plus NIIT if applicable, plus state)

**Comparison output:** For each year 1-40, compute `buyer_net_worth - renter_net_worth`. Buyer wins when delta > 0. Identify break-even year (first year delta crosses zero and stays positive).

**Cash purchase mode:** If user toggles "buy in cash," mortgage inputs hide, full home price is paid year 0, mortgage interest deduction is zero, opportunity cost calc uses full home price as the renter's starting investment.

## Tax Modeling

Derived from three user inputs: filing status, household income, ZIP code.

- **Federal income brackets:** Stored as a JSON data file (`/lib/data/tax-tables/federal-2025.json`). Engine derives marginal rate. Update file annually.
- **Long-term capital gains brackets:** Same approach, separate file.
- **Net Investment Income Tax (3.8%):** Applied if MAGI > $200K single / $250K married.
- **State income tax:** ZIP → state lookup (`/lib/data/zip-to-state.json`, stub with a small sample for v1; full file is ~42K rows, add later). State tax tables in `/lib/data/tax-tables/state-2025.json`. Some states tax cap gains as ordinary income; some have no income tax; encode per-state rules.
- **ZIPs crossing state lines:** Edge case, ignore for v1. Note as known limitation.
- **Standard deduction vs. itemization:** Engine computes both, uses whichever is higher. Itemization assumes mortgage interest + SALT cap ($10K) only — no charitable contributions modeled.
- **Override:** Every derived tax value has a manual override field. Power users can ignore the derivation entirely.

## Inputs (full list)

Each input below is a `DataProvider`. v1 default source is `'user'`.

**Property:**
- ZIP code (drives state tax lookup; in v2 drives appreciation, property tax rate, rent estimates)
- Home price
- Down payment (% or $ — toggleable)
- Cash purchase toggle

**Loan (hidden if cash purchase):**
- Mortgage interest rate (nominal)
- Loan term (years, default 30)
- Closing costs (% of home price, default 3%)
- PMI rate (% of loan balance annually, default 0.5%)
- Extra monthly payment ($)
- Lump-sum prepayments: list of `{year, amount}` entries

**Ownership costs:**
- Property tax rate (% of home value)
- Property tax growth rate
- Insurance rate (% of home value)
- Insurance growth rate
- HOA monthly ($)
- HOA growth rate
- Maintenance: % of home value OR $ override
- Maintenance growth rate

**Home appreciation:**
- Annual appreciation rate (nominal)
- Selling costs (% of sale price, default 7%)

**Rent:**
- Current monthly rent
- Annual rent growth rate
- Renter's insurance (monthly)

**Investment:**
- Expected nominal return on investments (% annually)
- Investment tax drag (% annually, default 0.5%)
- Tax-advantaged account % (% of invested surplus that goes into 401k/IRA, default 0%, applies LTCG rate of 0%)

**Taxes:**
- Filing status (single / married filing jointly / head of household)
- Household income
- All derived tax values exposed with override toggles

**Macro:**
- Inflation rate (drives nominal ↔ real toggle)

**Horizon:**
- Display range (1-40 years; chart always shows full 40, but break-even and headline number can be pinned to a specific year)

## UI / GUI Requirements

This is an interactive tool, not a form. Inputs and results live on the same screen with no submit button — every change recomputes immediately (debounced ~150ms).

**Layout:**
- Left rail (~35% width): collapsible input sections, scrollable
- Main area (~65%): headline result card on top, chart below, year-by-year detail table at the bottom (collapsible)
- Top bar: scenario selector (Scenario A / Scenario B), nominal/real toggle, year slider for headline result

**Input control pattern:**
Every numeric input is a paired number field + slider. Number field is the source of truth; slider visualizes range and enables sensitivity exploration. Slider ranges are reasonable defaults (e.g., mortgage rate 0-15%, appreciation -2% to 10%). Each input has a small "data source" indicator (in v1 always "manual"; in v2 shows "Zillow" with override link).

**Chart:**
Recharts line chart, x-axis years 1-40, two lines: buyer net worth and renter net worth. Hover shows year + both values + delta. Break-even year marked with a vertical reference line.

**Headline result:**
Big number — "At year [N], buying nets you $X more / less than renting" — with year slider to scrub through horizon.

**Compare mode:**
Toggle splits the screen: two input columns side-by-side, chart overlays both scenarios with four lines (Scenario A buy, A rent, B buy, B rent) or two delta lines.

**Scenario persistence:**
Save current inputs as a named scenario to localStorage. List of saved scenarios in a dropdown. "Load," "Duplicate," "Delete" actions per scenario.

**Aesthetic direction:**
Editorial / financial-publication feel. Think Bloomberg Terminal restraint meets a modern fintech site. Serif display font for headlines (e.g., Fraunces, Tiempos, or similar — not Inter, not Space Grotesk), clean sans for body, restrained color palette with one bold accent for the delta line. Dense but legible. Numbers are the hero.

## Folder Structure

```
/app
  /page.tsx                  # main calculator screen
  /layout.tsx
/components
  /inputs/                   # NumberSliderInput, PercentInput, CurrencyInput, etc.
  /sections/                 # PropertySection, LoanSection, TaxSection, etc.
  /results/                  # HeadlineResult, NetWorthChart, YearByYearTable
  /scenario/                 # ScenarioPicker, CompareToggle, SaveScenarioDialog
  /ui/                       # shadcn primitives
/lib
  /engine/
    types.ts                 # ScenarioInputs, ScenarioResults, YearResult
    amortization.ts          # mortgage schedule with extra + lump payments
    buyPath.ts               # year-by-year buy calculations
    rentPath.ts              # year-by-year rent+invest calculations
    compare.ts               # delta + break-even
    inflation.ts             # nominal ↔ real conversion
    index.ts                 # public calculate() entry point
  /data/
    providers/               # DataProvider interface + UserInputProvider
    tax-tables/              # federal-2025.json, state-2025.json
    zip-to-state.json        # stub for v1, full table in v2
    derive-tax.ts            # filing status + income + state → rates
  /store/
    scenarioStore.ts         # Zustand store
    persistence.ts           # localStorage save/load
/tests
  /engine/                   # unit tests for every engine function
```

## Implementation Order

1. **Engine first.** Build `/lib/engine/` with unit tests before any UI. Validate against a known online calculator (e.g., NYT rent-vs-buy) to confirm parity within ~2%. Cover edge cases: cash purchase, zero down, lump-sum prepayment in year 10, sale in year 1, negative appreciation.
2. **Data layer scaffolding.** `DataProvider` interface, `UserInputProvider`, tax tables, ZIP-to-state stub, `deriveTax()` function with tests.
3. **Zustand store.** One scenario, then two-scenario compare.
4. **Input components.** Build `NumberSliderInput` once, reuse everywhere.
5. **Input sections.** Wire each section to the store.
6. **Results display.** Headline → chart → year-by-year table.
7. **Scenario save/load + compare mode.**
8. **Visual polish pass.** Typography, spacing, color, motion. Don't skip this — it's what makes the tool feel trustworthy.

## Known Limitations to Document in the UI

- Assumes the user holds the home until sale (no refinancing modeled)
- Property tax rate is uniform per ZIP (real rates vary by municipality)
- Doesn't model rental security deposits, moving costs, or buyer's broker fee splits
- Investment return assumes a single portfolio with one expected return (no asset allocation)
- ZIPs crossing state lines pick the dominant state
- Capital gains exclusion ($250K/$500K) requires 2-of-5-year primary residence; engine assumes this is met
- Tax tables are 2025; will need annual update

## Future Work (post-v1)

- Real data integration: FRED for rates, Zillow ZHVI/ZORI for home values and rents, Census ACS for fallbacks
- Refinancing scenarios
- Multiple moves (rent for N years, then buy)
- Stress test mode: Monte Carlo over appreciation and return distributions
- Shareable URLs (encode scenario in query string)
- Export to PDF / CSV