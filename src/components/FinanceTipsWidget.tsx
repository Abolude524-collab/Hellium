'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  Compass,
  ArrowRight,
} from 'lucide-react';
import {
  FinanceTip,
  STATIC_FINANCE_TIPS,
  getContextualFinanceTips,
} from '@/services/financeTips';

interface FinanceTipsWidgetProps {
  totalSpent?: number;
  monthlyBudget?: number;
  baseCurrency?: string;
  topCategory?: string;
  expensesCount?: number;
}

export const FinanceTipsWidget: React.FC<FinanceTipsWidgetProps> = ({
  totalSpent = 0,
  monthlyBudget = 2500,
  baseCurrency = 'USD',
  topCategory = 'None',
  expensesCount = 0,
}) => {
  const contextualTips = getContextualFinanceTips(
    totalSpent,
    monthlyBudget,
    baseCurrency,
    topCategory,
    expensesCount
  );

  const allTips: FinanceTip[] = [...contextualTips, ...STATIC_FINANCE_TIPS];

  const [activeTipIndex, setActiveTipIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const currentTip = allTips[activeTipIndex % allTips.length];

  const handleNextTip = () => {
    setActiveTipIndex((prev) => (prev + 1) % allTips.length);
  };

  const filteredTips =
    selectedCategory === 'ALL'
      ? allTips
      : allTips.filter((t) => t.category === selectedCategory);

  return (
    <div className="bg-space-900 border border-space-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-space-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-purple-glow">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-montserrat text-lg font-bold text-white flex items-center space-x-2">
              <span>Personal Finance Advisor</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </h2>
            <p className="text-xs text-gray-400">
              Smart financial strategies &amp; multi-currency insights.
            </p>
          </div>
        </div>

        <button
          onClick={handleNextTip}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-space-950 border border-space-800 text-xs font-medium text-purple-300 hover:text-white hover:border-purple-500/40 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Next Strategy</span>
        </button>
      </div>

      {/* Spotlight Tip Card */}
      {currentTip && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-space-950 to-space-950 border border-purple-500/30 shadow-purple-glow space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              {currentTip.category}
            </span>
            {currentTip.isContextual && (
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-medium border border-pink-500/30">
                Live Alert
              </span>
            )}
          </div>

          <div>
            <h3 className="font-montserrat text-xl font-bold text-white mb-2">
              {currentTip.title}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed font-normal">
              {currentTip.detail}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-900/80 border border-purple-500/20 flex items-start space-x-3 text-xs text-purple-200">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white mb-0.5">Actionable Step:</strong>
              <span>{currentTip.actionableStep}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
        {['ALL', 'Budgeting', 'Multi-Currency', 'Savings', 'Smart Spending'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white border-purple-500 font-semibold shadow-purple-glow'
                : 'bg-space-950 border-space-800 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Finance Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="p-4 rounded-xl bg-space-950 border border-space-800 hover:border-purple-500/40 transition-all space-y-2 group cursor-pointer"
            onClick={() => {
              const idx = allTips.findIndex((t) => t.id === tip.id);
              if (idx !== -1) setActiveTipIndex(idx);
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-400">
                {tip.category}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-montserrat font-bold text-sm text-gray-100 group-hover:text-purple-300 transition-colors">
              {tip.title}
            </h4>
            <p className="text-xs text-gray-400 line-clamp-2">{tip.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinanceTipsWidget;
