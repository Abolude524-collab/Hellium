'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Globe2,
  PieChart as PieChartIcon,
  BellRing,
  ShieldCheck,
  Zap,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Sliders,
  Target,
  PlusCircle,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Sample Exchange rates for interactive landing demo
const DEMO_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.77,
  NGN: 1620.0,
  JPY: 141.5,
  CAD: 1.36,
  AUD: 1.48,
};

const DEMO_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  // Interactive Demo State
  const [demoAmount, setDemoAmount] = useState<number>(250);
  const [demoFromCurrency, setDemoFromCurrency] = useState<string>('EUR');
  const [demoBaseCurrency, setDemoBaseCurrency] = useState<string>('USD');

  // Calculation for live demo widget
  const fromRate = DEMO_RATES[demoFromCurrency] || 1;
  const toRate = DEMO_RATES[demoBaseCurrency] || 1;
  const convertedDemoAmount = (demoAmount / fromRate) * toRate;

  return (
    <div className="min-h-screen bg-space-950 text-gray-100 font-inter selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden relative">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[500px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-space-950/70 border-b border-space-900/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-purple-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-montserrat text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                Hellium
              </span>
              <span className="block text-[10px] font-semibold tracking-widest text-purple-400 uppercase">
                Multi-Currency
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-purple-300 transition-colors">
              Features
            </a>
            <a href="#converter" className="hover:text-purple-300 transition-colors">
              Live Converter
            </a>
            <a href="#goals" className="hover:text-purple-300 transition-colors">
              Savings Goals
            </a>
            <a href="#preview" className="hover:text-purple-300 transition-colors">
              Preview
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center space-x-4">
            {!loading && user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-montserrat text-sm font-semibold shadow-purple-glow hover:from-purple-500 hover:to-purple-400 transition-all flex items-center space-x-2 group"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-montserrat text-sm font-semibold shadow-purple-glow hover:opacity-95 transition-all flex items-center space-x-2 group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Multi-Currency Expenses, Savings Goals &amp; Analytics</span>
          <span className="text-purple-400">&bull;</span>
          <span className="text-pink-400 font-mono">Live Rates</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-montserrat text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Master Spending &amp; Goals Across <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
            Every Global Currency.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Log multi-currency expenses, track custom savings goals (Emergency Vault, Vacation, Laptop), and view total budget analytics in your unified base currency.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-montserrat font-semibold text-base shadow-purple-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 group"
          >
            <span>Start Tracking Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#goals"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-space-900/90 border border-space-800 text-gray-200 hover:text-white hover:border-purple-500/40 font-montserrat font-medium text-base transition-all flex items-center justify-center space-x-2"
          >
            <Target className="w-4 h-4 text-purple-400" />
            <span>Explore Financial Goals</span>
          </a>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-space-900/80 text-left">
          <div className="p-4 rounded-xl bg-space-900/40 border border-space-900 flex items-center space-x-3">
            <Globe2 className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-gray-200">150+ Currencies</div>
              <div className="text-xs text-gray-500">Live Exchange Rates</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-space-900/40 border border-space-900 flex items-center space-x-3">
            <Target className="w-6 h-6 text-pink-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-gray-200">Savings Goals</div>
              <div className="text-xs text-gray-500">Progress Tracking</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-space-900/40 border border-space-900 flex items-center space-x-3">
            <PieChartIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-gray-200">Visual Analytics</div>
              <div className="text-xs text-gray-500">Category Charts</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-space-900/40 border border-space-900 flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-pink-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-gray-200">Firebase Cloud</div>
              <div className="text-xs text-gray-500">Encrypted Scoped Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Multi-Currency Converter Section */}
      <section id="converter" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold">
                <span>Interactive Preview</span>
              </div>
              <h2 className="font-montserrat text-3xl sm:text-4xl font-bold tracking-tight text-white">
                See How Hellium Converts On The Fly
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Whether you pay in Euros while traveling or order software in US Dollars, Hellium automatically tracks the original cost and computes your unified base currency equivalent.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Saves original foreign amount & currency</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Calculates exact base currency total</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Recalculates budget limits seamlessly</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Widget */}
            <div className="lg:col-span-7 bg-space-900 border border-space-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-space-800">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  <span className="font-montserrat font-semibold text-sm text-gray-200">
                    Live Calculator Sample
                  </span>
                </div>
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full font-mono">
                  1 {demoFromCurrency} = {((1 / fromRate) * toRate).toFixed(4)} {demoBaseCurrency}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount and From Currency */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Expense Amount & Currency
                  </label>
                  <div className="flex rounded-xl bg-space-950 border border-space-800 focus-within:border-purple-500 overflow-hidden">
                    <input
                      type="number"
                      value={demoAmount}
                      onChange={(e) => setDemoAmount(Number(e.target.value) || 0)}
                      className="w-full bg-transparent px-4 py-3 text-white focus:outline-none font-mono text-base"
                    />
                    <select
                      value={demoFromCurrency}
                      onChange={(e) => setDemoFromCurrency(e.target.value)}
                      className="bg-space-900 text-purple-300 px-3 font-semibold text-sm focus:outline-none border-l border-space-800 cursor-pointer"
                    >
                      {DEMO_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Base Currency Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Target Base Currency
                  </label>
                  <select
                    value={demoBaseCurrency}
                    onChange={(e) => setDemoBaseCurrency(e.target.value)}
                    className="w-full bg-space-950 border border-space-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 cursor-pointer text-sm font-medium"
                  >
                    {DEMO_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Result Display Card */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-purple-950/40 to-space-950 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-1">
                    Logged to your budget as:
                  </div>
                  <div className="font-montserrat text-2xl sm:text-3xl font-extrabold text-white">
                    {convertedDemoAmount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: demoBaseCurrency,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Goals Showcase Section */}
      <section id="goals" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink-400">
              New Feature
            </span>
            <h2 className="font-montserrat text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Multi-Currency Financial Goals
            </h2>
            <p className="text-gray-400 text-base mt-3">
              Set savings targets in any global currency (Emergency Vault, Travel, Laptop) and log deposits with real-time base currency tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Goal Card 1 */}
            <div className="bg-space-900 border border-space-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
                  Travel &amp; Vacation
                </span>
                <span className="text-xs font-mono text-purple-300 font-bold">75% Saved</span>
              </div>
              <h3 className="font-montserrat text-xl font-bold text-white">Tokyo Trip 2027</h3>

              <div className="w-full bg-space-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-space-800">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-[75%]" />
              </div>

              <div className="p-3 rounded-xl bg-space-950 border border-space-800 text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Target Goal:</span>
                  <span className="font-mono text-white">¥500,000 JPY</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Current Saved:</span>
                  <span className="font-mono text-emerald-400">¥375,000 JPY</span>
                </div>
              </div>
            </div>

            {/* Goal Card 2 */}
            <div className="bg-space-900 border border-purple-500/40 shadow-purple-glow rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                  Emergency Fund
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">🚀 100% Completed!</span>
              </div>
              <h3 className="font-montserrat text-xl font-bold text-white">6-Month Safety Cushion</h3>

              <div className="w-full bg-space-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-space-800">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[100%]" />
              </div>

              <div className="p-3 rounded-xl bg-space-950 border border-space-800 text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Target Goal:</span>
                  <span className="font-mono text-white">$10,000 USD</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Current Saved:</span>
                  <span className="font-mono text-emerald-400">$10,000 USD</span>
                </div>
              </div>
            </div>

            {/* Goal Card 3 */}
            <div className="bg-space-900 border border-space-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
                  Major Purchase
                </span>
                <span className="text-xs font-mono text-purple-300 font-bold">40% Saved</span>
              </div>
              <h3 className="font-montserrat text-xl font-bold text-white">Workstation Laptop</h3>

              <div className="w-full bg-space-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-space-800">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-[40%]" />
              </div>

              <div className="p-3 rounded-xl bg-space-950 border border-space-800 text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Target Goal:</span>
                  <span className="font-mono text-white">€2,500 EUR</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Current Saved:</span>
                  <span className="font-mono text-emerald-400">€1,000 EUR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-montserrat text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Everything You Need For Global Wealth Control
          </h2>
          <p className="text-gray-400 text-base">
            Designed to fit your modern financial workflow with simple dark-mode aesthetics and intelligent automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl relative group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="font-montserrat text-lg font-bold text-white mb-2">
              Multi-Currency CRUD
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Add, edit, or remove expenses in 150+ currencies with real-time base currency conversion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl relative group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-montserrat text-lg font-bold text-white mb-2">
              Financial Goals
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Set savings targets in any currency and log deposit contributions with visual progress meters.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl relative group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-montserrat text-lg font-bold text-white mb-2">
              Visual Analytics
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Visualize category breakdowns and daily spending trends with Chart.js donut and line graphs.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-6 rounded-2xl relative group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="font-montserrat text-lg font-bold text-white mb-2">
              90% Budget Warning
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Receive automatic glowing warning banners when your total spend reaches 90% of your limit.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="preview" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Noble Glow Interface
            </span>
            <h2 className="font-montserrat text-3xl sm:text-4xl font-bold text-white mt-2">
              Sleek. Minimal. Powerful.
            </h2>
          </div>

          {/* Simulated App Dashboard Container */}
          <div className="bg-space-950 border border-space-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Top Metric Cards Mock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-space-900 border border-space-800 rounded-xl p-5">
                <div className="text-xs text-gray-400 font-medium">Total Monthly Spent</div>
                <div className="font-montserrat text-2xl font-bold text-white mt-1">$2,840.50</div>
                <div className="text-[11px] text-purple-400 font-mono mt-1">Base Currency: USD</div>
              </div>

              <div className="bg-space-900 border border-space-800 rounded-xl p-5">
                <div className="text-xs text-gray-400 font-medium">Remaining Budget</div>
                <div className="font-montserrat text-2xl font-bold text-emerald-400 mt-1">$159.50</div>
                <div className="text-[11px] text-gray-400 font-mono mt-1">Target Limit: $3,000</div>
              </div>

              <div className="bg-space-900 border border-pink-500/40 shadow-pink-glow rounded-xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-pink-400 font-semibold">
                  <span>Budget Threshold</span>
                  <span className="bg-pink-500/20 px-2 py-0.5 rounded text-[10px]">94.6% Used</span>
                </div>
                <div className="font-montserrat text-xl font-bold text-pink-300 mt-1">⚠️ Warning Level</div>
                <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-[94.6%]" />
                </div>
              </div>
            </div>

            {/* Recent Transactions Mock Table */}
            <div className="bg-space-900 border border-space-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between">
                <h4 className="font-montserrat font-bold text-sm text-gray-200">Recent Logged Expenses</h4>
                <span className="text-xs text-purple-400 font-mono">3 Multi-Currency Logs</span>
              </div>
              <div className="divide-y divide-space-800/60 text-sm">
                <div className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-200">Tokyo Dinner</div>
                    <div className="text-xs text-gray-500">Logged: 15,000 JPY &bull; Food</div>
                  </div>
                  <div className="text-right font-mono font-semibold text-purple-300">$106.01 USD</div>
                </div>

                <div className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-200">Eurostar Train Pass</div>
                    <div className="text-xs text-gray-500">Logged: 120 EUR &bull; Transport</div>
                  </div>
                  <div className="text-right font-mono font-semibold text-purple-300">$130.43 USD</div>
                </div>

                <div className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-200">Lagos Coworking Space</div>
                    <div className="text-xs text-gray-500">Logged: 80,000 NGN &bull; Utilities</div>
                  </div>
                  <div className="text-right font-mono font-semibold text-purple-300">$49.38 USD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-tr from-purple-950 via-space-900 to-space-950 border border-purple-500/30 shadow-purple-glow relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-montserrat text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Take Control of Your Global Expenses &amp; Goals?
            </h2>
            <p className="text-gray-300 text-base">
              Join financial organization today. Set up your base currency and track multi-currency budgets and savings goals in under 2 minutes.
            </p>
            <div className="pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-montserrat font-bold text-base shadow-purple-glow hover:opacity-95 transition-all group"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-space-900 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-montserrat font-bold text-gray-200">Hellium</span>
          </div>

          <div className="flex items-center space-x-6 text-xs">
            <Link href="/login" className="hover:text-purple-400 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-purple-400 transition-colors">
              Create Account
            </Link>
            <Link href="/goals" className="hover:text-purple-400 transition-colors">
              Savings Goals
            </Link>
            <Link href="/dashboard" className="hover:text-purple-400 transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="text-xs">
            Hellium &copy; {new Date().getFullYear()} &bull; Multi-Currency Personal Finance
          </div>
        </div>
      </footer>
    </div>
  );
}
