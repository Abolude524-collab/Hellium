'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  PlusCircle,
  TrendingUp,
  Award,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  History,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FinancialGoal, GoalCategory, GOAL_CATEGORIES } from '@/types/goal';
import {
  subscribeUserGoals,
  addGoalDoc,
  updateGoalDoc,
  deleteGoalDoc,
  addGoalContributionDoc,
} from '@/services/goalService';
import { getRates, getEffectiveConvertedAmount } from '@/services/exchangeRate';
import GoalModal from '@/components/GoalModal';
import ContributionModal from '@/components/ContributionModal';
import DepositHistoryModal from '@/components/DepositHistoryModal';

export default function GoalsPage() {
  const { user, userProfile } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [contribGoal, setContribGoal] = useState<FinancialGoal | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyGoal, setHistoryGoal] = useState<FinancialGoal | null>(null);

  const baseCurrency = userProfile?.baseCurrency || 'USD';

  // Subscribe to user goals
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserGoals(user.uid, (data) => {
      setGoals(data);
    });
    return () => unsub();
  }, [user]);

  // Fetch exchange rates
  useEffect(() => {
    getRates().then((rates) => setLiveRates(rates));
  }, []);

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenContribModal = (goal: FinancialGoal) => {
    setContribGoal(goal);
    setIsContribModalOpen(true);
  };

  const handleOpenHistoryModal = (goal: FinancialGoal) => {
    setHistoryGoal(goal);
    setIsHistoryModalOpen(true);
  };

  const handleDeleteGoal = async (goalId: string, title: string) => {
    if (!user) return;
    if (confirm(`Are you sure you want to delete goal "${title}"?`)) {
      try {
        await deleteGoalDoc(user.uid, goalId);
      } catch (err) {
        console.error('Error deleting goal:', err);
      }
    }
  };

  const handleGoalFormSubmit = async (data: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    targetDate: string;
    category: GoalCategory;
  }) => {
    if (!user) return;
    if (editingGoal) {
      await updateGoalDoc(user.uid, editingGoal.id, data);
    } else {
      await addGoalDoc(user.uid, data);
    }
  };

  const handleDepositSubmit = async (goalId: string, amount: number, depositCurrency: string) => {
    if (!user) return;
    await addGoalContributionDoc(user.uid, goalId, amount, depositCurrency);
  };

  // Convert goal amounts to base currency for totals
  const totalTargetBase = goals.reduce((sum, g) => {
    const converted = getEffectiveConvertedAmount(
      g.targetAmount,
      g.currency,
      0,
      g.currency,
      baseCurrency,
      liveRates
    );
    return sum + converted;
  }, 0);

  const totalSavedBase = goals.reduce((sum, g) => {
    const converted = getEffectiveConvertedAmount(
      g.currentAmount,
      g.currency,
      0,
      g.currency,
      baseCurrency,
      liveRates
    );
    return sum + converted;
  }, 0);

  const overallProgress =
    totalTargetBase > 0 ? Math.min(100, Math.round((totalSavedBase / totalTargetBase) * 100)) : 0;

  // Filter goals by category
  const filteredGoals = goals.filter((g) => {
    return selectedCategory === 'ALL' || g.category === selectedCategory;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-3xl font-extrabold tracking-tight text-white">
            Financial Goals
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Set savings targets, track deposit progress, and manage multi-currency goals in {baseCurrency}.
          </p>
        </div>

        <button
          onClick={handleOpenAddGoal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-montserrat text-sm font-semibold shadow-purple-glow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-space-900 border border-space-800 rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="text-xs text-gray-400 font-medium">Total Savings Target</div>
          <div className="font-montserrat text-2xl font-extrabold text-white mt-1">
            {totalTargetBase.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}
          </div>
          <div className="text-[11px] text-purple-400 font-mono mt-1">
            Across {goals.length} Active Goal(s)
          </div>
        </div>

        <div className="bg-space-900 border border-space-800 rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="text-xs text-gray-400 font-medium">Total Funds Saved</div>
          <div className="font-montserrat text-2xl font-extrabold text-emerald-400 mt-1">
            {totalSavedBase.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}
          </div>
          <div className="text-[11px] text-gray-400 font-mono mt-1">
            Converted Base Total ({baseCurrency})
          </div>
        </div>

        <div className="bg-space-900 border border-purple-500/30 shadow-purple-glow rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
            <span>Overall Goals Progress</span>
            <span className="bg-purple-500/20 px-2.5 py-0.5 rounded-full">{overallProgress}% Achieved</span>
          </div>
          <div className="w-full bg-space-950 h-2.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`whitespace-nowrap flex-shrink-0 sm:flex-shrink px-3 py-1.5 rounded-xl border transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-purple-600 text-white border-purple-500 font-semibold shadow-purple-glow'
              : 'bg-space-950 border-space-800 text-gray-400 hover:text-white'
          }`}
        >
          All Goals ({goals.length})
        </button>
        {GOAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap flex-shrink-0 sm:flex-shrink px-3 py-1.5 rounded-xl border transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white border-purple-500 font-semibold shadow-purple-glow'
                : 'bg-space-950 border-space-800 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-space-900 border border-space-800 rounded-2xl p-12 text-center text-gray-500 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-montserrat text-lg font-bold text-white mb-1">
              No Financial Goals Found
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {selectedCategory !== 'ALL'
                ? `No goals under ${selectedCategory}.`
                : 'Set your first financial target (e.g. Emergency Fund, New Laptop, Vacation) to start tracking savings.'}
            </p>
          </div>
          <button
            onClick={handleOpenAddGoal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-montserrat text-xs font-semibold shadow-purple-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const percent =
              goal.targetAmount > 0
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                : 0;

            const isCompleted = percent >= 100;

            const convertedTarget = getEffectiveConvertedAmount(
              goal.targetAmount,
              goal.currency,
              0,
              goal.currency,
              baseCurrency,
              liveRates
            );

            const convertedSaved = getEffectiveConvertedAmount(
              goal.currentAmount,
              goal.currency,
              0,
              goal.currency,
              baseCurrency,
              liveRates
            );

            return (
              <div
                key={goal.id}
                className="bg-space-900 border border-space-800 hover:border-purple-500/40 rounded-2xl p-6 shadow-lg space-y-5 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-semibold">
                        {goal.category}
                      </span>
                      <h3 className="font-montserrat text-xl font-bold text-white mt-2 group-hover:text-purple-300 transition-colors">
                        {goal.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditGoal(goal)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-space-800 transition-colors"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id, goal.title)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-pink-400 hover:bg-space-800 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span
                        className={`font-mono font-bold ${
                          isCompleted ? 'text-emerald-400' : 'text-purple-300'
                        }`}
                      >
                        {percent}% {isCompleted ? '🚀 Completed!' : ''}
                      </span>
                    </div>

                    <div className="w-full bg-space-950 h-3 rounded-full overflow-hidden p-0.5 border border-space-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts Grid */}
                  <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-400">Starting Balance:</span>
                      <span className="font-mono text-gray-300">
                        {(goal.initialAmount ?? 0).toLocaleString()} {goal.currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Target Goal:</span>
                      <span className="font-mono font-semibold text-white">
                        {goal.targetAmount.toLocaleString()} {goal.currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current Saved:</span>
                      <span className="font-mono font-semibold text-emerald-400">
                        {goal.currentAmount.toLocaleString()} {goal.currency}
                      </span>
                    </div>
                    {goal.currency !== baseCurrency && (
                      <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-space-800 text-purple-400 font-mono">
                        <span>Base Equivalent:</span>
                        <span>
                          {convertedSaved.toLocaleString('en-US', {
                            style: 'currency',
                            currency: baseCurrency,
                          })}{' '}
                          / {convertedTarget.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Deadline Badge */}
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Target Date: <strong className="text-gray-200">{goal.targetDate}</strong></span>
                  </div>
                </div>

                {/* Bottom Buttons */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenHistoryModal(goal)}
                    className="py-2.5 px-3 rounded-xl bg-space-950 hover:bg-space-800 text-gray-300 hover:text-white border border-space-800 font-montserrat text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                    title="View Deposit History"
                  >
                    <History className="w-3.5 h-3.5 text-purple-400" />
                    <span>History ({goal.deposits?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => handleOpenContribModal(goal)}
                    className="py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-montserrat text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 group-hover:border-purple-500"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Deposit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleGoalFormSubmit}
        initialData={editingGoal}
        baseCurrency={baseCurrency}
      />

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={isContribModalOpen}
        onClose={() => setIsContribModalOpen(false)}
        onSubmit={handleDepositSubmit}
        goal={contribGoal}
      />

      {/* Deposit History Modal */}
      <DepositHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        goal={historyGoal}
      />
    </div>
  );
}
