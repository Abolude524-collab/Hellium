'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MetricCard from '@/components/MetricCard';
import ExpenseModal from '@/components/ExpenseModal';
import CategoryChart from '@/components/CategoryChart';
import SpendingTrendChart from '@/components/SpendingTrendChart';
import CurrencyMixChart from '@/components/CurrencyMixChart';
import DateRangePicker from '@/components/DateRangePicker';
import FinanceTipsWidget from '@/components/FinanceTipsWidget';
import {
  DollarSign,
  Wallet,
  Globe,
  AlertTriangle,
  Plus,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Expense } from '@/types/expense';
import {
  subscribeUserExpenses,
  addExpenseDoc,
} from '@/services/expenseService';
import { getRates, getEffectiveConvertedAmount } from '@/services/exchangeRate';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filterPeriodLabel, setFilterPeriodLabel] = useState<string>('This Month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});

  const baseCurrency = userProfile?.baseCurrency || 'USD';
  const monthlyBudget = userProfile?.monthlyBudget || 2500;

  // Subscribe to real-time Firestore expenses
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserExpenses(user.uid, (data) => {
      setAllExpenses(data);
    });
    return () => unsub();
  }, [user]);

  // Fetch live exchange rates
  useEffect(() => {
    getRates().then((rates) => setLiveRates(rates));
  }, []);

  // Stable Date Filter handler
  const handleDateFilterChange = useCallback((filtered: Expense[], label: string) => {
    setFilteredExpenses(filtered);
    setFilterPeriodLabel(label);
  }, []);

  // Calculate metrics based on FILTERED expenses
  const totalSpent = filteredExpenses.reduce(
    (sum, item) =>
      sum +
      getEffectiveConvertedAmount(
        item.amount,
        item.currency,
        item.convertedAmount,
        item.baseCurrency,
        baseCurrency,
        liveRates
      ),
    0
  );

  // Current Month Total Spent specifically for Monthly Cap evaluation
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = allExpenses.filter((e) => e.date.startsWith(currentMonthPrefix));
  const thisMonthTotalSpent = thisMonthExpenses.reduce(
    (sum, item) =>
      sum +
      getEffectiveConvertedAmount(
        item.amount,
        item.currency,
        item.convertedAmount,
        item.baseCurrency,
        baseCurrency,
        liveRates
      ),
    0
  );

  const isCurrentMonthView =
    filterPeriodLabel.includes(now.toLocaleString('default', { month: 'long' })) ||
    filterPeriodLabel === 'This Month';
  const effectiveBudgetSpent = isCurrentMonthView ? totalSpent : thisMonthTotalSpent;
  const remainingBudget = monthlyBudget - effectiveBudgetSpent;
  const budgetUsagePercent =
    monthlyBudget > 0 ? Math.round((effectiveBudgetSpent / monthlyBudget) * 100) : 0;
  const isNearLimit = budgetUsagePercent >= 90;

  // Advanced Insights Calculations
  const highestExpenseItem = filteredExpenses.reduce<Expense | null>((max, item) => {
    const itemVal = getEffectiveConvertedAmount(
      item.amount,
      item.currency,
      item.convertedAmount,
      item.baseCurrency,
      baseCurrency,
      liveRates
    );
    const maxVal = max
      ? getEffectiveConvertedAmount(
          max.amount,
          max.currency,
          max.convertedAmount,
          max.baseCurrency,
          baseCurrency,
          liveRates
        )
      : 0;
    return itemVal > maxVal ? item : max;
  }, null);

  const highestExpenseValue = highestExpenseItem
    ? getEffectiveConvertedAmount(
        highestExpenseItem.amount,
        highestExpenseItem.currency,
        highestExpenseItem.convertedAmount,
        highestExpenseItem.baseCurrency,
        baseCurrency,
        liveRates
      )
    : 0;

  // Unique dates count in filter period for average calculation
  const uniqueDatesCount = new Set(filteredExpenses.map((e) => e.date)).size || 1;
  const averageDailySpend = totalSpent > 0 ? totalSpent / uniqueDatesCount : 0;

  // Category tally for top category
  const categoryCounts: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const topCategory =
    Object.keys(categoryCounts).reduce((a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b), '') ||
    'None';

  const handleAddExpense = async (data: {
    title: string;
    amount: number;
    currency: string;
    category: any;
    date: string;
  }) => {
    if (!user) return;
    await addExpenseDoc(user.uid, data, baseCurrency);
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-3xl font-extrabold tracking-tight text-white">
            Dashboard & Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Analyzing spending in <span className="text-purple-400 font-semibold">{baseCurrency}</span> for{' '}
            <strong className="text-white">{filterPeriodLabel}</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-montserrat text-sm font-semibold shadow-purple-glow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Date Range Selector Bar */}
      <DateRangePicker expenses={allExpenses} onFilterChange={handleDateFilterChange} />

      {/* Budget Over-Limit Warning Banner (Triggered when >= 90%) */}
      {isNearLimit && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 text-sm shadow-pink-glow animate-pulse">
          <AlertTriangle className="w-5 h-5 text-pink-400 flex-shrink-0" />
          <div>
            <span className="font-semibold">
              Monthly Budget Warning ({isCurrentMonthView ? filterPeriodLabel : 'Current Month'}):
            </span>{' '}
            You have reached {budgetUsagePercent}% of your monthly cap (
            {effectiveBudgetSpent.toLocaleString('en-US', {
              style: 'currency',
              currency: baseCurrency,
            })}{' '}
            spent of{' '}
            {monthlyBudget.toLocaleString('en-US', {
              style: 'currency',
              currency: baseCurrency,
            })}{' '}
            limit).
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Period Total Spent"
          value={totalSpent.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}
          subtitle={`Scope: ${filterPeriodLabel}`}
          badge={`${filteredExpenses.length} Logs`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="default"
        />

        <MetricCard
          title="Remaining Budget"
          value={remainingBudget.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}
          subtitle={`Monthly Cap: ${monthlyBudget.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}`}
          badge={`${budgetUsagePercent}% Used`}
          icon={<Wallet className="w-5 h-5" />}
          variant={isNearLimit ? 'warning' : 'default'}
        />

        <MetricCard
          title="Top Category"
          value={topCategory}
          subtitle={`Most Frequent (${filterPeriodLabel})`}
          badge="High Frequency"
          icon={<Award className="w-5 h-5 text-purple-400" />}
          variant="default"
        />

        <MetricCard
          title="Avg. Daily Spend"
          value={averageDailySpend.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}
          subtitle={`Across ${uniqueDatesCount} active day(s)`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Spending Trend Line Chart */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-space-800">
          <div>
            <h2 className="font-montserrat text-lg font-bold text-white">
              Spending Trajectory & Trend
            </h2>
            <p className="text-xs text-gray-400">Daily expenses progression in {baseCurrency}</p>
          </div>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <SpendingTrendChart
          expenses={filteredExpenses}
          baseCurrency={baseCurrency}
          ratesMap={liveRates}
        />
      </div>

      {/* Category Donut Chart & Currency Mix Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-space-900 border border-space-800 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-montserrat text-lg font-bold text-white">
                Category Spending Breakdown
              </h2>
              <p className="text-xs text-gray-400">Category distribution in {baseCurrency}</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </div>

          <CategoryChart
            expenses={filteredExpenses}
            baseCurrency={baseCurrency}
            ratesMap={liveRates}
          />
        </div>

        {/* Currency Mix Distribution Chart */}
        <div className="bg-space-900 border border-space-800 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-montserrat text-lg font-bold text-white">
                Multi-Currency Log Distribution
              </h2>
              <p className="text-xs text-gray-400">Breakdown of currencies logged before conversion</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          <CurrencyMixChart expenses={filteredExpenses} />
        </div>
      </div>

      {/* Personal Finance Tips & Smart Insights Widget */}
      <FinanceTipsWidget
        totalSpent={totalSpent}
        monthlyBudget={monthlyBudget}
        baseCurrency={baseCurrency}
        topCategory={topCategory}
        expensesCount={filteredExpenses.length}
      />

      {/* Advanced Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Highest Single Expense Highlight */}
        <div className="bg-space-900 border border-space-800 rounded-2xl p-5 sm:p-6 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Highest Expense ({filterPeriodLabel})</span>
            {highestExpenseItem ? (
              <div className="mt-1">
                <div className="font-montserrat text-xl font-extrabold text-white">
                  {highestExpenseValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: baseCurrency,
                  })}
                </div>
                <div className="text-xs text-purple-400 mt-0.5 font-medium">
                  {highestExpenseItem.title} ({highestExpenseItem.amount} {highestExpenseItem.currency})
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-2">No transactions recorded yet</div>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Active Rates Summary */}
        <div className="bg-space-900 border border-space-800 rounded-2xl p-5 sm:p-6 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Active Rates Engine</span>
            <div className="font-montserrat text-base font-bold text-white mt-1">
              Base: {baseCurrency} &bull; Live Rate API
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Synced across 150+ global currencies
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table Filtered by Period */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-montserrat text-lg font-bold text-white">
              Expenses ({filterPeriodLabel})
            </h2>
            <p className="text-xs text-gray-400">Showing {filteredExpenses.length} transactions</p>
          </div>
          <a
            href="/transactions"
            className="text-xs font-montserrat font-semibold text-purple-400 hover:text-purple-300"
          >
            View All &rarr;
          </a>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="block sm:hidden space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              No expenses found for {filterPeriodLabel}. Click &quot;Add Expense&quot; above.
            </div>
          ) : (
            filteredExpenses.slice(0, 8).map((exp) => {
              const effectiveConverted = getEffectiveConvertedAmount(
                exp.amount,
                exp.currency,
                exp.convertedAmount,
                exp.baseCurrency,
                baseCurrency,
                liveRates
              );

              return (
                <div key={exp.id} className="p-4 rounded-xl bg-space-950 border border-space-800 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-montserrat font-bold text-sm text-white">{exp.title}</h4>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                        {exp.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{exp.date}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-space-800/80 text-xs">
                    <div>
                      <span className="text-gray-400 text-[11px] block">Logged Amount:</span>
                      <span className="font-mono text-gray-200">{exp.amount} {exp.currency}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-[11px] block">Converted ({baseCurrency}):</span>
                      <span className="font-mono font-bold text-purple-400">
                        {effectiveConverted.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-space-950/80 text-xs uppercase font-montserrat font-semibold text-gray-400 border-b border-space-800">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Logged Amount</th>
                <th className="py-3 px-4">Converted ({baseCurrency})</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-500">
                    No expenses found for {filterPeriodLabel}. Click &quot;Add Expense&quot; above.
                  </td>
                </tr>
              ) : (
                filteredExpenses.slice(0, 8).map((exp) => {
                  const effectiveConverted = getEffectiveConvertedAmount(
                    exp.amount,
                    exp.currency,
                    exp.convertedAmount,
                    exp.baseCurrency,
                    baseCurrency,
                    liveRates
                  );

                  return (
                    <tr key={exp.id} className="hover:bg-space-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">{exp.title}</td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">
                        {exp.amount} {exp.currency}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-400 font-semibold">
                        {effectiveConverted.toLocaleString('en-US', {
                          style: 'currency',
                          currency: baseCurrency,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-400">{exp.date}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddExpense}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
