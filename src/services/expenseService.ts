import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Expense, ExpenseCategory, UserSettings } from '@/types/expense';
import { convertCurrency } from './exchangeRate';

export interface CreateExpenseInput {
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
}

const LOCAL_EXPENSES_KEY = (userId: string) => `hellium_local_expenses_${userId || 'guest'}`;

function getLocalExpenses(userId: string): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalExpenses(userId: string, expenses: Expense[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_EXPENSES_KEY(userId), JSON.stringify(expenses));
  } catch (e) {
    console.warn('Failed to save to local storage:', e);
  }
}

/**
 * Add a new expense doc for the user, converting currency to user's base currency
 */
export async function addExpenseDoc(
  userId: string,
  input: CreateExpenseInput,
  baseCurrency: string
): Promise<string> {
  const { convertedAmount, rate } = await convertCurrency(
    input.amount,
    input.currency,
    baseCurrency
  );

  const newExpense: Expense = {
    id: 'local_' + Date.now() + Math.random().toString(36).substring(2, 6),
    title: input.title,
    amount: input.amount,
    currency: input.currency,
    convertedAmount,
    baseCurrency,
    exchangeRate: rate,
    category: input.category,
    date: input.date,
    createdAt: Date.now(),
  };

  // 1. Always update local storage first for instant feedback & resilience
  const currentLocal = getLocalExpenses(userId);
  const updatedLocal = [newExpense, ...currentLocal];
  saveLocalExpenses(userId, updatedLocal);

  // 2. Sync to Firestore if userId exists
  if (userId) {
    try {
      const expensesRef = collection(db, 'users', userId, 'expenses');
      const docRef = await addDoc(expensesRef, {
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        convertedAmount,
        baseCurrency,
        exchangeRate: rate,
        category: input.category,
        date: input.date,
        createdAt: Date.now(),
      });
      newExpense.id = docRef.id;
    } catch (err) {
      console.warn('Firestore write failed, expense saved locally:', err);
    }
  }

  return newExpense.id;
}

/**
 * Update an existing expense doc
 */
export async function updateExpenseDoc(
  userId: string,
  expenseId: string,
  input: CreateExpenseInput,
  baseCurrency: string
): Promise<void> {
  const { convertedAmount, rate } = await convertCurrency(
    input.amount,
    input.currency,
    baseCurrency
  );

  // Update local storage first
  const currentLocal = getLocalExpenses(userId);
  const updatedLocal = currentLocal.map((exp) => {
    if (exp.id === expenseId) {
      return {
        ...exp,
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        convertedAmount,
        baseCurrency,
        exchangeRate: rate,
        category: input.category,
        date: input.date,
      };
    }
    return exp;
  });
  saveLocalExpenses(userId, updatedLocal);

  // Update Firestore if not local fallback ID
  if (userId && !expenseId.startsWith('local_')) {
    try {
      const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
      await updateDoc(expenseRef, {
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        convertedAmount,
        baseCurrency,
        exchangeRate: rate,
        category: input.category,
        date: input.date,
      });
    } catch (err) {
      console.warn('Firestore update failed, fallback to local storage:', err);
    }
  }
}

/**
 * Delete an expense doc
 */
export async function deleteExpenseDoc(userId: string, expenseId: string): Promise<void> {
  // Delete from local storage
  const currentLocal = getLocalExpenses(userId);
  const updatedLocal = currentLocal.filter((exp) => exp.id !== expenseId);
  saveLocalExpenses(userId, updatedLocal);

  // Delete from Firestore
  if (userId && !expenseId.startsWith('local_')) {
    try {
      const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
      await deleteDoc(expenseRef);
    } catch (err) {
      console.warn('Firestore delete failed:', err);
    }
  }
}

/**
 * Subscribe to real-time expenses for a user (combining Firestore + LocalStorage)
 */
export function subscribeUserExpenses(
  userId: string,
  onExpensesUpdate: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
): () => void {
  // If no userId, return local storage expenses
  if (!userId) {
    const local = getLocalExpenses('');
    onExpensesUpdate(local);
    return () => {};
  }

  const expensesRef = collection(db, 'users', userId, 'expenses');
  const q = query(expensesRef); // Removed orderBy to avoid missing Firestore index errors

  return onSnapshot(
    q,
    (snapshot) => {
      const firestoreExpenses: Expense[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Untitled Expense',
          amount: Number(data.amount) || 0,
          currency: data.currency || 'USD',
          convertedAmount: Number(data.convertedAmount ?? data.amount ?? 0),
          baseCurrency: data.baseCurrency || 'USD',
          exchangeRate: Number(data.exchangeRate) || 1,
          category: data.category || 'Other',
          date: data.date || new Date().toISOString().split('T')[0],
          createdAt: data.createdAt || 0,
        };
      });

      const localExpenses = getLocalExpenses(userId);

      // Merge Firestore & Local expenses by unique ID
      const map = new Map<string, Expense>();
      firestoreExpenses.forEach((item) => map.set(item.id, item));
      localExpenses.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item);
      });

      const merged = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
      saveLocalExpenses(userId, merged);
      onExpensesUpdate(merged);
    },
    (err) => {
      console.warn('Firestore snapshot error, falling back to local storage:', err);
      const local = getLocalExpenses(userId);
      onExpensesUpdate(local);
      if (onError) onError(err);
    }
  );
}

/**
 * Update User Base Currency and Monthly Budget in Firestore
 */
export async function updateUserSettingsDoc(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, settings, { merge: true });
  } catch (err) {
    console.warn('Failed to update user settings in Firestore:', err);
  }
}
