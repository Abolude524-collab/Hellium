import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FinancialGoal, GoalCategory, GoalDeposit } from '@/types/goal';
import { convertCurrency } from './exchangeRate';

export interface CreateGoalInput {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  currency: string;
  targetDate: string;
  category: GoalCategory;
}

const LOCAL_GOALS_KEY = (userId: string) => `hellium_local_goals_${userId || 'guest'}`;

function getLocalGoals(userId: string): FinancialGoal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_GOALS_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalGoals(userId: string, goals: FinancialGoal[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_GOALS_KEY(userId), JSON.stringify(goals));
  } catch (e) {
    console.warn('Failed to save goals locally:', e);
  }
}

/**
 * Add a new Financial Goal
 */
export async function addGoalDoc(
  userId: string,
  input: CreateGoalInput
): Promise<string> {
  const initialAmount = input.currentAmount || 0;

  const newGoal: FinancialGoal = {
    id: 'goal_local_' + Date.now() + Math.random().toString(36).substring(2, 6),
    title: input.title,
    targetAmount: input.targetAmount,
    currentAmount: initialAmount,
    initialAmount: initialAmount,
    currency: input.currency,
    targetDate: input.targetDate,
    category: input.category,
    createdAt: Date.now(),
    deposits: [],
  };

  // Local storage update first for instant feedback
  const currentLocal = getLocalGoals(userId);
  const updatedLocal = [newGoal, ...currentLocal];
  saveLocalGoals(userId, updatedLocal);

  if (userId) {
    try {
      const goalsRef = collection(db, 'users', userId, 'goals');
      const docRef = await addDoc(goalsRef, {
        title: input.title,
        targetAmount: input.targetAmount,
        currentAmount: initialAmount,
        initialAmount: initialAmount,
        currency: input.currency,
        targetDate: input.targetDate,
        category: input.category,
        createdAt: Date.now(),
        deposits: [],
      });
      newGoal.id = docRef.id;
    } catch (err) {
      console.warn('Firestore write failed, goal saved locally:', err);
    }
  }

  return newGoal.id;
}

/**
 * Update an existing Goal
 */
export async function updateGoalDoc(
  userId: string,
  goalId: string,
  input: CreateGoalInput
): Promise<void> {
  const currentLocal = getLocalGoals(userId);
  const updatedLocal = currentLocal.map((g) => {
    if (g.id === goalId) {
      return {
        ...g,
        title: input.title,
        targetAmount: input.targetAmount,
        initialAmount: input.currentAmount !== undefined ? input.currentAmount : (g.initialAmount ?? g.currentAmount),
        currency: input.currency,
        targetDate: input.targetDate,
        category: input.category,
      };
    }
    return g;
  });
  saveLocalGoals(userId, updatedLocal);

  if (userId && !goalId.startsWith('goal_local_')) {
    try {
      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      await updateDoc(goalRef, {
        title: input.title,
        targetAmount: input.targetAmount,
        initialAmount: input.currentAmount !== undefined ? input.currentAmount : 0,
        currency: input.currency,
        targetDate: input.targetDate,
        category: input.category,
      });
    } catch (err) {
      console.warn('Firestore goal update failed, fallback local:', err);
    }
  }
}

/**
 * Add a deposit/contribution to a Goal
 */
export async function addGoalContributionDoc(
  userId: string,
  goalId: string,
  contributionAmount: number,
  depositCurrency?: string
): Promise<number> {
  let existingAmount = 0;
  let initialAmount = 0;
  let goalCurrency = 'USD';
  let existingDeposits: GoalDeposit[] = [];
  let goalFound = false;

  // 1. Try reading from Firestore if user is authenticated & not local ID
  if (userId && !goalId.startsWith('goal_local_')) {
    try {
      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      const snap = await getDoc(goalRef);
      if (snap.exists()) {
        const data = snap.data();
        existingAmount = Number(data.currentAmount) || 0;
        initialAmount = Number(data.initialAmount) || 0;
        goalCurrency = data.currency || 'USD';
        existingDeposits = Array.isArray(data.deposits) ? data.deposits : [];
        goalFound = true;
      }
    } catch (e) {
      console.warn('Failed to fetch goal from Firestore, checking local storage:', e);
    }
  }

  // 2. Fallback to local storage if not found in Firestore or offline
  if (!goalFound) {
    const currentLocal = getLocalGoals(userId);
    const localGoal = currentLocal.find((g) => g.id === goalId);
    if (localGoal) {
      existingAmount = Number(localGoal.currentAmount) || 0;
      initialAmount = Number(localGoal.initialAmount) || 0;
      goalCurrency = localGoal.currency || 'USD';
      existingDeposits = Array.isArray(localGoal.deposits) ? localGoal.deposits : [];
    }
  }

  // 3. Convert contribution to goal currency if different
  let convertedContribution = contributionAmount;
  const depCurrency = depositCurrency || goalCurrency;
  if (depCurrency !== goalCurrency) {
    const { convertedAmount } = await convertCurrency(
      contributionAmount,
      depCurrency,
      goalCurrency
    );
    convertedContribution = convertedAmount;
  }

  const newDeposit: GoalDeposit = {
    id: 'dep_' + Date.now() + Math.random().toString(36).substring(2, 6),
    amount: contributionAmount,
    currency: depCurrency,
    convertedAmount: convertedContribution,
    date: new Date().toISOString().split('T')[0],
    createdAt: Date.now(),
  };

  const updatedDeposits = [newDeposit, ...existingDeposits];
  const depositsTotal = updatedDeposits.reduce((sum, d) => sum + d.convertedAmount, 0);
  const newTotal = Number((initialAmount + depositsTotal).toFixed(2));

  // 4. Update local storage
  const currentLocal = getLocalGoals(userId);
  const updatedLocal = currentLocal.map((g) => {
    if (g.id === goalId) {
      return {
        ...g,
        currentAmount: newTotal,
        initialAmount: initialAmount || g.initialAmount || 0,
        deposits: updatedDeposits,
      };
    }
    return g;
  });
  saveLocalGoals(userId, updatedLocal);

  // 5. Update Firestore
  if (userId && !goalId.startsWith('goal_local_')) {
    try {
      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      await updateDoc(goalRef, {
        currentAmount: newTotal,
        initialAmount: initialAmount,
        deposits: updatedDeposits,
      });
    } catch (err) {
      console.warn('Firestore contribution write failed, saved locally:', err);
    }
  }

  return newTotal;
}

/**
 * Delete a Goal
 */
export async function deleteGoalDoc(userId: string, goalId: string): Promise<void> {
  const currentLocal = getLocalGoals(userId);
  const updatedLocal = currentLocal.filter((g) => g.id !== goalId);
  saveLocalGoals(userId, updatedLocal);

  if (userId && !goalId.startsWith('goal_local_')) {
    try {
      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      await deleteDoc(goalRef);
    } catch (err) {
      console.warn('Firestore delete goal failed:', err);
    }
  }
}

/**
 * Subscribe to user goals
 */
export function subscribeUserGoals(
  userId: string,
  onGoalsUpdate: (goals: FinancialGoal[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!userId) {
    const local = getLocalGoals('');
    onGoalsUpdate(local);
    return () => {};
  }

  const goalsRef = collection(db, 'users', userId, 'goals');
  const q = query(goalsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const firestoreGoals: FinancialGoal[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Untitled Goal',
          targetAmount: Number(data.targetAmount) || 0,
          currentAmount: Number(data.currentAmount) || 0,
          initialAmount: Number(data.initialAmount ?? data.currentAmount ?? 0),
          currency: data.currency || 'USD',
          targetDate: data.targetDate || new Date().toISOString().split('T')[0],
          category: data.category || 'Other',
          createdAt: data.createdAt || 0,
          deposits: Array.isArray(data.deposits) ? data.deposits : [],
        };
      });

      const localGoals = getLocalGoals(userId);
      const map = new Map<string, FinancialGoal>();
      firestoreGoals.forEach((item) => map.set(item.id, item));
      localGoals.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item);
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
      saveLocalGoals(userId, merged);
      onGoalsUpdate(merged);
    },
    (err) => {
      console.warn('Firestore goals snapshot error, fallback to local storage:', err);
      const local = getLocalGoals(userId);
      onGoalsUpdate(local);
      if (onError) onError(err);
    }
  );
}
