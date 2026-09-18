'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Expense } from '@/types/expense';
import { getEffectiveConvertedAmount } from '@/services/exchangeRate';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SpendingTrendChartProps {
  expenses: Expense[];
  baseCurrency: string;
  ratesMap?: Record<string, number>;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  expenses,
  baseCurrency,
  ratesMap = {},
}) => {
  if (expenses.length === 0) {
    return (
      <div className="h-64 border border-dashed border-space-800 rounded-xl flex flex-col items-center justify-center text-gray-500 text-xs space-y-2 p-4">
        <span>No expense trend data available.</span>
      </div>
    );
  }

  // Sort expenses by date ascending
  const sortedExpenses = [...expenses].sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate amounts per unique date
  const dateTotalsMap: Record<string, number> = {};
  sortedExpenses.forEach((e) => {
    const converted = getEffectiveConvertedAmount(
      e.amount,
      e.currency,
      e.convertedAmount,
      e.baseCurrency,
      baseCurrency,
      ratesMap
    );
    dateTotalsMap[e.date] = (dateTotalsMap[e.date] || 0) + converted;
  });

  const dates = Object.keys(dateTotalsMap);
  const amounts = Object.values(dateTotalsMap);

  const chartData = {
    labels: dates,
    datasets: [
      {
        fill: true,
        label: `Daily Spend (${baseCurrency})`,
        data: amounts,
        borderColor: '#A855F7',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.35,
        pointBackgroundColor: '#F472B6',
        pointBorderColor: '#0B0F19',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#F3F4F6',
        bodyColor: '#A855F7',
        borderColor: '#1F2937',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return ` Spent: ${val.toLocaleString('en-US', {
              style: 'currency',
              currency: baseCurrency,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(31, 41, 55, 0.5)',
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          color: 'rgba(31, 41, 55, 0.5)',
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10 },
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="h-64 w-full relative p-2">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default SpendingTrendChart;
