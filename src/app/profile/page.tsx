'use client';

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Globe,
  Wallet,
  ShieldCheck,
  Save,
  CheckCircle2,
  Calendar,
  Sparkles,
  Receipt,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SUPPORTED_CURRENCIES } from '@/types/expense';
import { subscribeUserExpenses } from '@/services/expenseService';

export default function ProfilePage() {
  const { user, userProfile, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('United States');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [monthlyBudget, setMonthlyBudget] = useState(2500);

  const [expenseCount, setExpenseCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setBio(userProfile.bio || '');
      setCountry(userProfile.country || 'United States');
      setBaseCurrency(userProfile.baseCurrency || 'USD');
      setMonthlyBudget(userProfile.monthlyBudget ?? 2500);
    }
  }, [userProfile, user]);

  // Subscribe to count logged expenses
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserExpenses(user.uid, (expenses) => {
      setExpenseCount(expenses.length);
    });
    return () => unsub();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccessMessage(false);

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        country,
        baseCurrency,
        monthlyBudget: Number(monthlyBudget) || 0,
      });

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (err) {
      console.error('Error updating user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const userInitial = (displayName || user?.email || 'H').charAt(0).toUpperCase();
  const providerId = user?.providerData[0]?.providerId === 'google.com' ? 'Google Auth' : 'Email & Password';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-montserrat text-3xl font-extrabold tracking-tight text-white">
          User Profile
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your personal account details, financial preferences, and profile settings.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm shadow-purple-glow animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <span>Profile updated successfully! Your details are saved to your account.</span>
        </div>
      )}

      {/* User Hero Profile Card */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Container */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-[2px] shadow-purple-glow flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-space-950 flex items-center justify-center text-3xl font-montserrat font-bold text-purple-300">
              {userInitial}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="font-montserrat text-2xl font-bold text-white">
                {displayName || 'Anonymous User'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold self-center sm:self-auto">
                Global Member
              </span>
            </div>

            <p className="text-sm text-gray-400 flex items-center justify-center sm:justify-start space-x-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>{user?.email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-gray-400">
              <div className="flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Base Currency: <strong className="text-gray-200">{baseCurrency}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Receipt className="w-3.5 h-3.5 text-pink-400" />
                <span>Logged Expenses: <strong className="text-gray-200">{expenseCount}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-space-900 border border-space-800 rounded-2xl p-5 sm:p-8 shadow-lg space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-space-800">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-montserrat text-lg font-bold text-white">
                Personal Details & Preferences
              </h3>
              <p className="text-xs text-gray-400">
                Update how your name and preferences appear in Hellium.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider">
                Full / Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Enoch Abolude"
                className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider">
                Country / Region
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Germany">Germany</option>
                <option value="Canada">Canada</option>
                <option value="Japan">Japan</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other International</option>
              </select>
            </div>

            {/* Base Currency */}
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
            </div>

            {/* Monthly Budget */}
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bio / Financial Notes */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-montserrat font-semibold text-gray-300 uppercase tracking-wider">
              Bio / Financial Goal Note
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Managing global freelance expenses across USD, EUR & NGN..."
              className="w-full px-4 py-3 rounded-xl bg-space-950 border border-space-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-space-800">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-montserrat text-sm font-semibold shadow-purple-glow transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Account Security & Metadata Card */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-6 sm:p-8 shadow-lg space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-space-800">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-montserrat text-lg font-bold text-white">
              Account Security & Data Protection
            </h3>
            <p className="text-xs text-gray-400">Authentication provider details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-space-950/60 border border-space-800">
            <span className="text-gray-400 block mb-1">Sign-In Provider</span>
            <span className="font-semibold text-gray-200">{providerId}</span>
          </div>

          <div className="p-4 rounded-xl bg-space-950/60 border border-space-800">
            <span className="text-gray-400 block mb-1">Firebase User ID (UID)</span>
            <span className="font-mono text-purple-400 text-[11px] truncate block">{user?.uid}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
