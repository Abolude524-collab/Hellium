'use client';

import React, { useState, useEffect } from 'react';
import { X, Target, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { FinancialGoal, GoalCategory, GOAL_CATEGORIES } from '@/types/goal';
import { SUPPORTED_CURRENCIES } from '@/types/expense';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    targetDate: string;
    category: GoalCategory;
  }) => Promise<void>;
  initialData?: FinancialGoal | null;
  baseCurrency: string;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  baseCurrency,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('0');
  const [currency, setCurrency] = useState('USD');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Emergency Fund');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (initialData) {
      setTitle(initialData.title);
      setTargetAmount(String(initialData.targetAmount));
      setCurrentAmount(String(initialData.currentAmount));
      setCurrency(initialData.currency);
      setTargetDate(initialData.targetDate);
      setCategory(initialData.category);
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setCurrency(baseCurrency || 'USD');
      // Default deadline: 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetDate(d.toISOString().split('T')[0]);
      setCategory('Emergency Fund');
    }
  }, [initialData, isOpen, baseCurrency]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numTarget = Number(targetAmount);
    const numCurrent = Number(currentAmount) || 0;

    if (!title.trim()) {
      setErrorMsg('Please enter a goal title.');
      return;
    }
    if (isNaN(numTarget) || numTarget <= 0) {
      setErrorMsg('Please enter a target amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        targetAmount: numTarget,
        currentAmount: numCurrent,
        currency,
        targetDate,
        category,
      });
      onClose();
    } catch (err: any) {
      console.error('Error submitting goal modal:', err);
      setErrorMsg(err?.message || 'Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-space-900 border border-space-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-space-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-montserrat text-lg font-bold text-white">
                {initialData ? 'Edit Financial Goal' : 'Create New Goal'}
              </h3>
              <p className="text-xs text-gray-400">
                Track savings targets in any global currency.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-pink-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Goal Title */}
          <div>
            <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Goal Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Japan Trip 2027, Emergency Vault"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          {/* Target Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Target Savings Goal
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors font-medium"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Saved & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Initial / Starting Balance
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors"
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Date (Deadline) */}
          <div>
            <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Target Completion Date
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-space-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-montserrat text-sm font-semibold shadow-purple-glow transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
