'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { Expense } from '@/types/expense';

export type DatePreset =
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'LAST_30_DAYS'
  | 'LAST_90_DAYS'
  | 'THIS_YEAR'
  | 'ALL_TIME'
  | 'CUSTOM';

interface DateRangePickerProps {
  expenses: Expense[];
  onFilterChange: (filtered: Expense[], label: string) => void;
}

const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  expenses,
  onFilterChange,
}) => {
  const [preset, setPreset] = useState<DatePreset>('THIS_MONTH');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Helper to filter expenses by preset
  const filterExpenses = useCallback(
    (selectedPreset: DatePreset, startStr?: string, endStr?: string) => {
      const now = new Date();
      let filtered = [...expenses];
      let label = 'All Time';

      if (selectedPreset === 'THIS_MONTH') {
        const year = now.getFullYear();
        const month = now.getMonth();
        const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        filtered = expenses.filter((e) => e.date >= startOfMonth && e.date <= endOfMonth);
        label = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      } else if (selectedPreset === 'LAST_MONTH') {
        const nowMonth = now.getMonth();
        const year = nowMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const month = nowMonth === 0 ? 11 : nowMonth - 1;
        const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        filtered = expenses.filter((e) => e.date >= startOfMonth && e.date <= endOfMonth);
        const prevDate = new Date(year, month, 1);
        label = prevDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      } else if (selectedPreset === 'LAST_30_DAYS') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const startStr30 = formatLocalDate(thirtyDaysAgo);

        filtered = expenses.filter((e) => e.date >= startStr30);
        label = 'Last 30 Days';
      } else if (selectedPreset === 'LAST_90_DAYS') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        const startStr90 = formatLocalDate(ninetyDaysAgo);

        filtered = expenses.filter((e) => e.date >= startStr90);
        label = 'Last 90 Days';
      } else if (selectedPreset === 'THIS_YEAR') {
        const year = now.getFullYear();
        const startOfYear = `${year}-01-01`;
        const endOfYear = `${year}-12-31`;

        filtered = expenses.filter((e) => e.date >= startOfYear && e.date <= endOfYear);
        label = `Year ${year}`;
      } else if (selectedPreset === 'ALL_TIME') {
        filtered = [...expenses];
        label = 'All Time';
      } else if (selectedPreset === 'CUSTOM') {
        if (startStr && endStr) {
          filtered = expenses.filter((e) => e.date >= startStr && e.date <= endStr);
          label = `${startStr} to ${endStr}`;
        } else if (startStr) {
          filtered = expenses.filter((e) => e.date >= startStr);
          label = `From ${startStr}`;
        } else if (endStr) {
          filtered = expenses.filter((e) => e.date <= endStr);
          label = `Up to ${endStr}`;
        } else {
          label = 'Custom Date Range';
        }
      }

      return { filtered, label };
    },
    [expenses]
  );

  // Re-run filter automatically whenever expenses change or preset changes!
  useEffect(() => {
    const { filtered, label } = filterExpenses(preset, customStart, customEnd);
    onFilterChange(filtered, label);
  }, [expenses, preset, customStart, customEnd, filterExpenses, onFilterChange]);

  const handleSelectPreset = (selectedPreset: DatePreset) => {
    setPreset(selectedPreset);
    if (selectedPreset === 'CUSTOM') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreset('CUSTOM');
  };

  return (
    <div className="bg-space-900 border border-space-800 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-montserrat font-semibold text-gray-300">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Time Period:</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-2 text-xs font-medium overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSelectPreset('THIS_MONTH')}
            className={`whitespace-nowrap flex-shrink-0 sm:flex-shrink px-3 py-1.5 rounded-xl border transition-all ${
              preset === 'THIS_MONTH'
                ? 'bg-purple-600 text-white border-purple-500 shadow-purple-glow font-semibold'
                : 'bg-space-950 border-space-800 text-gray-400 hover:text-white hover:border-space-700'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('LAST_MONTH')}
            className={`whitespace-nowrap flex-shrink-0 sm:flex-shrink px-3 py-1.5 rounded-xl border transition-all ${
              preset === 'LAST_MONTH'
                ? 'bg-purple-600 text-white border-purple-500 shadow-purple-glow font-semibold'
                : 'bg-space-950 border-space-800 text-gray-400 hover:text-white hover:border-space-700'
            }`}
          >
            Last Month
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('LAST_30_DAYS')}
            className={`whitespace-nowrap flex-shrink-0 sm:flex-shrink px-3 py-1.5 rounded-xl border transition-all ${
              preset === 'LAST_30_DAYS'
                ? 'bg-purple-600 text-white border-purple-500 shadow-purple-glow font-semibold'
                : 'bg-space-950 border-space-800 text-gray-400 hover:text-white hover:border-space-700'
            }`}
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('THIS_YEAR')}
            className={`whitespace-nowrap flex-shrink-0 sm:flex-shrink px-3 py-1.5 rounded-xl border transition-all ${
              preset === 'THIS_YEAR'
                ? 'bg-purple-600 text-white border-purple-500 shadow-purple-glow font-semibold'
                : 'bg-space-950 border-space-800 text-gray-400 hover:text-white hover:border-space-700'
            }`}
          >
            YTD
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('ALL_TIME')}
            className={`whitespace-nowrap flex-shrink-0 sm:flex-shrink px-3 py-1.5 rounded-xl border transition-all ${
              preset === 'ALL_TIME'
                ? 'bg-purple-600 text-white border-purple-500 shadow-purple-glow font-semibold'
                : 'bg-space-950 border-space-800 text-gray-400 hover:text-white hover:border-space-700'
            }`}
          >
            All Time
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('CUSTOM')}
            className={`whitespace-nowrap flex-shrink-0 sm:flex-shrink px-3 py-1.5 rounded-xl border transition-all ${
              preset === 'CUSTOM'
                ? 'bg-purple-600 text-white border-purple-500 shadow-purple-glow font-semibold'
                : 'bg-space-950 border-space-800 text-gray-400 hover:text-white hover:border-space-700'
            }`}
          >
            Custom Range...
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Form */}
      {showCustomPicker && (
        <form
          onSubmit={handleCustomSubmit}
          className="pt-3 border-t border-space-800 flex flex-wrap items-center gap-3 text-xs"
        >
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-space-950 border border-space-800 rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-space-950 border border-space-800 rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors shadow-sm"
          >
            Apply Range
          </button>
        </form>
      )}
    </div>
  );
};

export default DateRangePicker;
