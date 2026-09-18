'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';
import {
  subscribeUserExpenses,
  addExpenseDoc,
  updateExpenseDoc,
  deleteExpenseDoc,
} from '@/services/expenseService';
import { getRates, getEffectiveConvertedAmount } from '@/services/exchangeRate';
import ExpenseModal from '@/components/ExpenseModal';
import DateRangePicker from '@/components/DateRangePicker';

export default function TransactionsPage() {
  const { user, userProfile } = useAuth();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [dateFilteredExpenses, setDateFilteredExpenses] = useState<Expense[]>([]);
  const [filterPeriodLabel, setFilterPeriodLabel] = useState<string>('This Month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const baseCurrency = userProfile?.baseCurrency || 'USD';

  // Subscribe to Firestore expenses
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserExpenses(user.uid, (data) => {
      setAllExpenses(data);
    });
    return () => unsub();
  }, [user]);

  // Fetch exchange rates
  useEffect(() => {
    getRates().then((rates) => setLiveRates(rates));
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filterPeriodLabel]);

  const handleDateFilterChange = (filtered: Expense[], label: string) => {
    setDateFilteredExpenses(filtered);
    setFilterPeriodLabel(label);
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (expenseId: string, title: string) => {
    if (!user) return;
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteExpenseDoc(user.uid, expenseId);
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    }
  };

  const handleModalSubmit = async (data: {
    title: string;
    amount: number;
    currency: string;
    category: ExpenseCategory;
    date: string;
  }) => {
    if (!user) return;
    if (editingExpense) {
      await updateExpenseDoc(user.uid, editingExpense.id, data, baseCurrency);
    } else {
      await addExpenseDoc(user.uid, data, baseCurrency);
    }
  };

  // Filter expenses by search query & category within date boundary
  const filteredExpenses = dateFilteredExpenses.filter((exp) => {
    const matchesTitle = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || exp.category === selectedCategory;
    return matchesTitle && matchesCategory;
  });

  // Calculate pagination boundaries
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE));
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = [
      'Title',
      'Category',
      'Logged Amount',
      'Logged Currency',
      `Converted Amount (${baseCurrency})`,
      'Date',
    ];

    const rows = filteredExpenses.map((exp) => {
      const effectiveConverted = getEffectiveConvertedAmount(
        exp.amount,
        exp.currency,
        exp.convertedAmount,
        exp.baseCurrency,
        baseCurrency,
        liveRates
      );
      return [
        `"${exp.title.replace(/"/g, '""')}"`,
        `"${exp.category}"`,
        exp.amount,
        exp.currency,
        effectiveConverted.toFixed(2),
        exp.date,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `hellium_expenses_${filterPeriodLabel.toLowerCase().replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-3xl font-extrabold tracking-tight text-white">
            Transactions
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Reviewing expenses in base currency ({baseCurrency}) for{' '}
            <strong className="text-white">{filterPeriodLabel}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredExpenses.length === 0}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-space-900 border border-space-800 hover:border-purple-500/50 text-gray-200 hover:text-white font-montserrat text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="Export filtered transactions to CSV"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-montserrat text-sm font-semibold shadow-purple-glow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {/* Date Range Picker Bar */}
      <DateRangePicker expenses={allExpenses} onFilterChange={handleDateFilterChange} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-space-900 border border-space-800 rounded-2xl shadow-lg">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search expenses by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2 bg-space-950 border border-space-800 rounded-xl px-3 py-1.5 text-xs text-gray-300">
            <Filter className="w-4 h-4 text-purple-400" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-space-900">
                All Categories
              </option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-space-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
        {/* Mobile Responsive Cards View */}
        <div className="block sm:hidden space-y-3">
          {paginatedExpenses.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              No transactions found for {filterPeriodLabel} matching current filters.
            </div>
          ) : (
            paginatedExpenses.map((expense) => {
              const effectiveConverted = getEffectiveConvertedAmount(
                expense.amount,
                expense.currency,
                expense.convertedAmount,
                expense.baseCurrency,
                baseCurrency,
                liveRates
              );

              return (
                <div
                  key={expense.id}
                  className="p-4 rounded-xl bg-space-950 border border-space-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-montserrat font-bold text-sm text-white">
                        {expense.title}
                      </h4>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(expense)}
                        className="p-2 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-space-900 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id, expense.title)}
                        className="p-2 rounded-lg text-gray-400 hover:text-pink-400 hover:bg-space-900 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-space-800/80 text-xs">
                    <div>
                      <span className="text-gray-400 text-[11px] block">Logged Amount:</span>
                      <span className="font-mono text-gray-200">
                        {expense.amount} {expense.currency}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-[11px] block">Converted ({baseCurrency}):</span>
                      <span className="font-mono font-bold text-purple-400">
                        {effectiveConverted.toLocaleString('en-US', {
                          style: 'currency',
                          currency: baseCurrency,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 text-right font-mono">
                    Date: {expense.date}
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
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Logged Amount</th>
                <th className="py-3.5 px-4">Converted ({baseCurrency})</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800/60">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                    No transactions found for {filterPeriodLabel} matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((expense) => {
                  const effectiveConverted = getEffectiveConvertedAmount(
                    expense.amount,
                    expense.currency,
                    expense.convertedAmount,
                    expense.baseCurrency,
                    baseCurrency,
                    liveRates
                  );

                  return (
                    <tr key={expense.id} className="hover:bg-space-800/30 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{expense.title}</td>
                      <td className="py-4 px-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-200">
                        {expense.amount} {expense.currency}
                      </td>
                      <td className="py-4 px-4 font-mono text-purple-400 font-semibold">
                        {effectiveConverted.toLocaleString('en-US', {
                          style: 'currency',
                          currency: baseCurrency,
                        })}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">{expense.date}</td>
                      <td className="py-4 px-4 text-right text-xs font-semibold">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(expense)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-space-800 transition-colors"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id, expense.title)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-pink-400 hover:bg-space-800 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredExpenses.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-space-800 text-xs text-gray-400">
            <div>
              Showing{' '}
              <strong className="text-white">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-white">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredExpenses.length)}
              </strong>{' '}
              of <strong className="text-white">{filteredExpenses.length}</strong> transactions
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-space-950 border border-space-800 text-gray-300 hover:text-white hover:border-purple-500/50 disabled:opacity-40 disabled:hover:border-space-800 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-gray-200 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-space-950 border border-space-800 text-gray-300 hover:text-white hover:border-purple-500/50 disabled:opacity-40 disabled:hover:border-space-800 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expense Modal for Adding or Editing */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingExpense}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
