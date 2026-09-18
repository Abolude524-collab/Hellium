export type GoalCategory =
  | 'Emergency Fund'
  | 'Travel & Vacation'
  | 'Investment & Savings'
  | 'Major Purchase'
  | 'Debt Payoff'
  | 'Other';

export interface GoalDeposit {
  id: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  initialAmount?: number;
  currency: string;
  targetDate: string; // YYYY-MM-DD
  category: GoalCategory;
  createdAt?: number;
  deposits?: GoalDeposit[];
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  'Emergency Fund',
  'Travel & Vacation',
  'Investment & Savings',
  'Major Purchase',
  'Debt Payoff',
  'Other',
];
