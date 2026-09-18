export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Utilities'
  | 'Entertainment'
  | 'Shopping'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  baseCurrency: string;
  exchangeRate: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  createdAt?: number;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface UserSettings {
  baseCurrency: string;
  monthlyBudget: number;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Other',
];
