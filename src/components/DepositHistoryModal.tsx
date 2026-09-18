'use client';

import React from 'react';
import { X, History, Sparkles, ArrowRight, Wallet, Calendar } from 'lucide-react';
import { FinancialGoal } from '@/types/goal';

interface DepositHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
}

export const DepositHistoryModal: React.FC<DepositHistoryModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  if (!isOpen || !goal) return null;

  const deposits = goal.deposits || [];
  const initialAmount = goal.initialAmount ?? 0;
  const depositsTotal = deposits.reduce((sum, d) => sum + d.convertedAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-space-900 border border-space-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-space-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-montserrat text-lg font-bold text-white">
                Deposit History
              </h3>
              <p className="text-xs text-purple-300 font-semibold">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Summary Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-space-950 border border-space-800 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Starting Balance:</span>
              <span className="font-mono font-bold text-gray-200">
                {initialAmount.toLocaleString()} {goal.currency}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Logged Deposits ({deposits.length}):</span>
              <span className="font-mono font-bold text-purple-400">
                +{depositsTotal.toLocaleString()} {goal.currency}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Current Balance:</span>
              <span className="font-mono font-bold text-emerald-400">
                {goal.currentAmount.toLocaleString()} {goal.currency}
              </span>
            </div>
          </div>

          {/* Deposits Timeline List */}
          <div className="space-y-3">
            <h4 className="font-montserrat text-xs font-semibold uppercase text-gray-400 tracking-wider">
              Contribution Logs ({deposits.length})
            </h4>

            {deposits.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 bg-space-950/60 rounded-xl border border-space-800/80">
                No deposit history recorded yet. Use &quot;Add Deposit&quot; on the goal card to log contributions.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3.5 rounded-xl bg-space-950 border border-space-800 flex items-center justify-between text-xs hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        +
                      </div>
                      <div>
                        <div className="font-mono font-bold text-white">
                          {dep.amount.toLocaleString()} {dep.currency}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center space-x-1.5 mt-0.5">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          <span>{dep.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block uppercase font-medium">Added to Goal</span>
                      <span className="font-mono font-semibold text-purple-300">
                        +{dep.convertedAmount.toLocaleString()} {goal.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-space-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-space-950 border border-space-800 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositHistoryModal;
