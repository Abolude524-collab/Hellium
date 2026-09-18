'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Expense, EXPENSE_CATEGORIES } from '@/types/expense';
import { getEffectiveConvertedAmount } from '@/services/exchangeRate';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  expenses: Expense[];
  baseCurrency: string;
  ratesMap?: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
  Food: { bg: 'rgba(168, 85, 247, 0.85)', border: '#A855F7' },
  Transport: { bg: 'rgba(244, 114, 182, 0.85)', border: '#F472B6' },
  Utilities: { bg: 'rgba(59, 130, 246, 0.85)', border: '#3B82F6' },
  Entertainment: { bg: 'rgba(16, 185, 129, 0.85)', border: '#10B981' },
  Shopping: { bg: 'rgba(245, 158, 11, 0.85)', border: '#F59E0B' },
  Other: { bg: 'rgba(156, 163, 175, 0.85)', border: '#9CA3AF' },
};

export const CategoryChart: React.FC<CategoryChartProps> = ({
  expenses,
  baseCurrency,
  ratesMap = {},
}) => {
  // Aggregate expenses by category using effective converted amount
  const categoryTotals = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<string, number>);

  expenses.forEach((expense) => {
    const cat = expense.category || 'Other';
    const amount = getEffectiveConvertedAmount(
      expense.amount,
      expense.currency,
      expense.convertedAmount,
      expense.baseCurrency,
      baseCurrency,
      ratesMap
    );
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
  });

  const activeCategories = EXPENSE_CATEGORIES.filter((cat) => categoryTotals[cat] > 0);
  const dataValues = activeCategories.map((cat) => categoryTotals[cat]);

  if (expenses.length === 0 || dataValues.length === 0) {
    return (
      <div className="h-64 border border-dashed border-space-800 rounded-xl flex flex-col items-center justify-center text-gray-500 text-xs space-y-2 p-4">
        <span>No expenses recorded yet.</span>
        <span className="text-[11px] text-gray-600">
          Click &quot;Add Expense&quot; above to log your first transaction.
        </span>
      </div>
    );
  }

  const chartData = {
    labels: activeCategories,
    datasets: [
      {
        data: dataValues,
        backgroundColor: activeCategories.map((cat) => CATEGORY_COLORS[cat]?.bg || '#9CA3AF'),
        borderColor: activeCategories.map((cat) => CATEGORY_COLORS[cat]?.border || '#9CA3AF'),
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#D1D5DB',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#F3F4F6',
        bodyColor: '#A855F7',
        borderColor: '#1F2937',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return ` ${context.label}: ${val.toLocaleString('en-US', {
              style: 'currency',
              currency: baseCurrency,
            })}`;
          },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="h-64 w-full relative flex items-center justify-center p-2">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

export default CategoryChart;
