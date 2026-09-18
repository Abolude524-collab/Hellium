'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Globe, Wallet, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateUserSettingsDoc } from '@/services/expenseService';
import { SUPPORTED_CURRENCIES } from '@/types/expense';

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [monthlyBudget, setMonthlyBudget] = useState(2500);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.baseCurrency) setBaseCurrency(userProfile.baseCurrency);
      if (userProfile.monthlyBudget !== undefined) setMonthlyBudget(userProfile.monthlyBudget);
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSavedSuccess(false);

    try {
      await updateUserSettingsDoc(user.uid, {
        baseCurrency,
        monthlyBudget: Number(monthlyBudget) || 0,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings to Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="font-montserrat text-3xl font-extrabold tracking-tight text-white">
          Application Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Configure your preferred base currency and monthly budget cap.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm shadow-purple-glow">
          <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <span>Settings saved successfully! Your dashboard will recalculate metrics.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Base Currency & Budget Card */}
        <div className="bg-space-900 border border-space-800 rounded-2xl p-5 sm:p-8 shadow-lg space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-space-800">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-montserrat text-lg font-bold text-white">
                Currency & Budget Preferences
              </h2>
              <p className="text-xs text-gray-400">
                All multi-currency expenses will convert to your chosen Base Currency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Base Currency Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider">
                Base Currency
              </label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors font-medium"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">
                Determines how metrics and charts on the dashboard are formatted.
              </p>
            </div>

            {/* Monthly Budget Input */}
            <div className="space-y-2">
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider">
                Monthly Budget Limit ({baseCurrency})
              </label>
              <div className="relative">
                <Wallet className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors font-mono"
                  placeholder="e.g. 2500"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                You will receive a warning when spending reaches 90% of this cap.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Account Scope Info */}
        <div className="bg-space-900 border border-space-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-space-800">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-montserrat text-lg font-bold text-white">
                Account Scoping & Security
              </h2>
              <p className="text-xs text-gray-400">
                Data isolation provided by Firestore Security Rules.
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-400 space-y-2">
            <p>
              Your settings and expenses are saved under strictly scoped Firestore document paths (`users/{'{userId}'}`).
            </p>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-montserrat text-sm font-semibold shadow-purple-glow transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
