export type SpendingCategory = "l" | "f" | "a" | "m" | "t" | "o";

export interface Spending {
  id: number;
  travelId: number;
  travelerId: number;
  stepId: number | null;
  ideaId: number | null;
  category: SpendingCategory;
  label: string;
  amount: string;
  paidDate: string | null;
  shares: { travelerId: number; amount: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface SpendingInput {
  travelerId: number;
  category: SpendingCategory;
  label: string;
  amount: string;
  paidDate: string | null;
  stepId: number | null;
  ideaId: number | null;
  shares?: { travelerId: number; amount: string }[];
}

export interface SpendingSummary {
  total: string;
  byCategory: { category: SpendingCategory; total: string }[];
  balances: {
    travelerId: number;
    name: string;
    hasLeft: boolean;
    paid: string;
    owed: string;
    balance: string;
  }[];
  settlements: { debtorId: number; creditorId: number; amount: string }[];
}
