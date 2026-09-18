'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, DollarSign, Calendar, Tag, Globe, AlertCircle } from 'lucide-react';
import {
  Expense,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  SUPPORTED_CURRENCIES,
} from '@/types/expense';
import { convertCurrency } from '@/services/exchangeRate';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    amount: number;
    currency: string;
    category: ExpenseCategory;
    date: string;
  }) => Promise<void>;
  initialData?: Expense | null;
  baseCurrency: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  baseCurrency,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [convertedPreview, setConvertedPreview] = useState<number | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (initialData) {
      setTitle(initialData.title);
      setAmount(String(initialData.amount));
      setCurrency(initialData.currency);
      setCategory(initialData.category);
      setDate(initialData.date);
    } else {
      setTitle('');
      setAmount('');
      setCurrency(baseCurrency || 'USD');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen, baseCurrency]);

  // Live conversion preview calculation as user types amount or changes currency
  useEffect(() => {
    const numAmount = Number(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      let isMounted = true;
      convertCurrency(numAmount, currency, baseCurrency).then((res) => {
        if (isMounted) {
          setConvertedPreview(res.convertedAmount);
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      setConvertedPreview(null);
    }
  }, [amount, currency, baseCurrency]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = Number(amount);
    if (!title.trim()) {
      setErrorMsg('Please enter an expense title.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        amount: numAmount,
        currency,
        category,
        date,
      });
      onClose();
    } catch (err: any) {
      console.error('Error submitting expense modal:', err);
      setErrorMsg(err?.message || 'Failed to save expense. Please try again.');
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-montserrat text-lg font-bold text-white">
                {initialData ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <p className="text-xs text-gray-400">
                Log expense in any currency with automatic base conversion.
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-pink-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Expense Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery Shopping, Train Ticket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          {/* Amount & Currency Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Logged Amount
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Expense Currency
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

          {/* Live Currency Preview Badge */}
          {convertedPreview !== null && (
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs">
              <span className="text-gray-300 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Base Currency Equivalent:</span>
              </span>
              <span className="font-mono font-bold text-purple-300 text-sm">
                {convertedPreview.toLocaleString('en-US', {
                  style: 'currency',
                  currency: baseCurrency,
                })}
              </span>
            </div>
          )}

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Expense Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
