import type {
  AmortizationSchedule,
  AnnualAmortizationRow,
  LumpSumPrepayment,
  MonthlyAmortizationRow,
} from "./types";

export interface AmortizationInputs {
  loanAmount: number;
  homePrice: number;
  annualInterestRate: number;
  termYears: number;
  extraMonthlyPayment: number;
  lumpSumPrepayments: LumpSumPrepayment[];
  pmiRate: number;
  horizonYears: number;
}

const MONTHS_PER_YEAR = 12;
const PMI_DROPOFF_LTV = 0.78;
const CENT = 0.01;

export function calculateMonthlyMortgagePayment(
  loanAmount: number,
  annualInterestRate: number,
  termYears: number,
): number {
  if (loanAmount <= 0) {
    return 0;
  }

  const numberOfPayments = termYears * MONTHS_PER_YEAR;
  const monthlyRate = annualInterestRate / MONTHS_PER_YEAR;

  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }

  const growth = (1 + monthlyRate) ** numberOfPayments;
  return loanAmount * ((monthlyRate * growth) / (growth - 1));
}

export function buildAmortizationSchedule(
  inputs: AmortizationInputs,
): AmortizationSchedule {
  const monthlyPayment = calculateMonthlyMortgagePayment(
    inputs.loanAmount,
    inputs.annualInterestRate,
    inputs.termYears,
  );
  const lumpSumsByYear = new Map<number, number>();

  for (const prepayment of inputs.lumpSumPrepayments) {
    const existing = lumpSumsByYear.get(prepayment.year) ?? 0;
    lumpSumsByYear.set(prepayment.year, existing + Math.max(0, prepayment.amount));
  }

  const monthlyRows: MonthlyAmortizationRow[] = [];
  let balance = Math.max(0, inputs.loanAmount);
  let pmiDropped = inputs.homePrice === 0 || balance / inputs.homePrice <= PMI_DROPOFF_LTV;
  let payoffMonth: number | null = balance === 0 ? 0 : null;
  const maxMonths = inputs.horizonYears * MONTHS_PER_YEAR;

  for (let month = 1; month <= maxMonths; month += 1) {
    const year = Math.ceil(month / MONTHS_PER_YEAR);
    const startingBalance = balance;
    const monthlyRate = inputs.annualInterestRate / MONTHS_PER_YEAR;
    const interestPayment = balance * monthlyRate;
    const basePrincipal = Math.max(0, monthlyPayment - interestPayment);
    const principalPayment = Math.min(balance, basePrincipal);
    balance -= principalPayment;

    const extraPrincipalPayment = Math.min(
      balance,
      Math.max(0, inputs.extraMonthlyPayment),
    );
    balance -= extraPrincipalPayment;

    const isYearEnd = month % MONTHS_PER_YEAR === 0;
    const requestedLumpSum = isYearEnd ? lumpSumsByYear.get(year) ?? 0 : 0;
    const lumpSumPayment = Math.min(balance, requestedLumpSum);
    balance -= lumpSumPayment;

    if (!pmiDropped && inputs.homePrice > 0 && balance / inputs.homePrice <= PMI_DROPOFF_LTV) {
      pmiDropped = true;
    }

    const pmiActive = !pmiDropped && startingBalance > CENT;
    const pmiPayment = pmiActive
      ? (startingBalance * inputs.pmiRate) / MONTHS_PER_YEAR
      : 0;

    if (balance <= CENT) {
      balance = 0;
      payoffMonth = payoffMonth ?? month;
    }

    monthlyRows.push({
      month,
      year,
      startingBalance,
      scheduledPayment:
        startingBalance <= CENT ? 0 : interestPayment + principalPayment,
      interestPayment,
      principalPayment,
      extraPrincipalPayment,
      lumpSumPayment,
      endingBalance: balance,
      pmiPayment,
      pmiActive,
    });

    if (balance === 0 && month >= inputs.termYears * MONTHS_PER_YEAR) {
      break;
    }
  }

  return {
    monthlyPayment,
    monthlyRows,
    annualRows: toAnnualRows(monthlyRows, inputs.horizonYears, inputs.loanAmount),
    payoffMonth,
  };
}

function toAnnualRows(
  monthlyRows: MonthlyAmortizationRow[],
  horizonYears: number,
  originalLoanAmount: number,
): AnnualAmortizationRow[] {
  const rows: AnnualAmortizationRow[] = [];

  for (let year = 1; year <= horizonYears; year += 1) {
    const rowsForYear = monthlyRows.filter((row) => row.year === year);
    const firstRow = rowsForYear[0];
    const lastRow = rowsForYear[rowsForYear.length - 1];

    rows.push({
      year,
      startingBalance: firstRow?.startingBalance ?? rows.at(-1)?.endingBalance ?? originalLoanAmount,
      principalPaid: sum(rowsForYear, (row) => row.principalPayment),
      interestPaid: sum(rowsForYear, (row) => row.interestPayment),
      extraPrincipalPaid: sum(rowsForYear, (row) => row.extraPrincipalPayment),
      lumpSumPaid: sum(rowsForYear, (row) => row.lumpSumPayment),
      endingBalance: lastRow?.endingBalance ?? rows.at(-1)?.endingBalance ?? 0,
      pmiPaid: sum(rowsForYear, (row) => row.pmiPayment),
      pmiActiveAtYearEnd: lastRow?.pmiActive ?? false,
    });
  }

  return rows;
}

function sum<T>(values: T[], selector: (value: T) => number): number {
  return values.reduce((total, value) => total + selector(value), 0);
}
