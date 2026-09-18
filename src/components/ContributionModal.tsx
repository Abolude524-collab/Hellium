'use client';

import React, { useState, useEffect } from 'react';
import { X, DollarSign, PlusCircle, Globe } from 'lucide-react';
import { FinancialGoal } from '@/types/goal';
import { SUPPORTED_CURRENCIES } from '@/types/expense';
import { convertCurrency } from '@/services/exchangeRate';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalId: string, amount: number, depositCurrency: string) => Promise<void>;
  goal: FinancialGoal | null;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [depositCurrency, setDepositCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(false);
  const [convertedPreview, setConvertedPreview] = useState<number | null>(null);

  useEffect(() => {
    if (goal) {
      setDepositCurrency(goal.currency || 'USD');
    }
  }, [goal, isOpen]);

  useEffect(() => {
    const numAmount = Number(amount);
    if (!isNaN(numAmount) && numAmount > 0 && goal && depositCurrency !== goal.currency) {
      let isMounted = true;
      convertCurrency(numAmount, depositCurrency, goal.currency).then((res) => {
        if (isMounted) setConvertedPreview(res.convertedAmount);
      });
      return () => {
        isMounted = false;
      };
    } else {
      setConvertedPreview(null);
    }
  }, [amount, depositCurrency, goal]);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setLoading(true);
    try {
      await onSubmit(goal.id, numAmount, depositCurrency);
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Error adding contribution:', err);
    } finally {
      setLoading(false);
    }
  };

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-space-900 border border-space-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-space-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-montserrat text-lg font-bold text-white">
                Add Savings Deposit
              </h3>
              <p className="text-xs text-purple-300 font-medium">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          <div className="p-4 rounded-xl bg-space-950 border border-space-800 space-y-1 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Goal Target:</span>
              <span className="font-mono text-gray-200">
                {goal.targetAmount.toLocaleString()} {goal.currency}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Current Progress:</span>
              <span className="font-mono text-purple-400 font-semibold">
                {goal.currentAmount.toLocaleString()} {goal.currency}
              </span>
            </div>
            <div className="flex justify-between text-gray-400 pt-1 border-t border-space-800">
              <span>Remaining to Save:</span>
              <span className="font-mono text-pink-400 font-semibold">
                {remaining.toLocaleString()} {goal.currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Deposit Amount
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Deposit Currency
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <select
                  value={depositCurrency}
                  onChange={(e) => setDepositCurrency(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer font-medium"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {convertedPreview !== null && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-mono flex items-center justify-between">
              <span>Converted Deposit ({goal.currency}):</span>
              <span className="font-bold">+{convertedPreview.toLocaleString()} {goal.currency}</span>
            </div>
          )}

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
              {loading ? 'Adding Deposit...' : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributionModal;
