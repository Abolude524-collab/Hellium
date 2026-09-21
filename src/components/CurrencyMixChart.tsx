'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Expense } from '@/types/expense';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CurrencyMixChartProps {
  expenses: Expense[];
}

const CURRENCY_PALETTE: Record<string, string> = {
  USD: '#3B82F6',
  EUR: '#A855F7',
  GBP: '#EC4899',
  NGN: '#10B981',
  JPY: '#F59E0B',
  CAD: '#6366F1',
  AUD: '#14B8A6',
};

export const CurrencyMixChart: React.FC<CurrencyMixChartProps> = ({ expenses }) => {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 640);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  if (expenses.length === 0) {
    return (
      <div className="h-48 border border-dashed border-space-800 rounded-xl flex items-center justify-center text-gray-500 text-xs">
        No currency mix data.
      </div>
    );
  }

  // Count distribution of expenses per logged currency
  const currencyCounts: Record<string, number> = {};
  expenses.forEach((e) => {
    const c = e.currency || 'USD';
    currencyCounts[c] = (currencyCounts[c] || 0) + 1;
  });

  const currencies = Object.keys(currencyCounts);
  const counts = Object.values(currencyCounts);

  const chartData = {
    labels: currencies,
    datasets: [
      {
        data: counts,
        backgroundColor: currencies.map(
          (c, idx) =>
            CURRENCY_PALETTE[c] ||
            `hsl(${(idx * 65) % 360}, 70%, 60%)`
        ),
        borderColor: '#111827',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? ('bottom' as const) : ('right' as const),
        labels: {
          color: '#D1D5DB',
          font: { size: 11 },
          padding: isMobile ? 8 : 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} transactions`,
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="h-56 sm:h-60 w-full relative flex items-center justify-center p-1">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

export default CurrencyMixChart;
