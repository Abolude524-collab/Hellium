# 🌌 Hellium — Multi-Currency Finance & Savings Tracker

**Hellium** is a sleek, web-based personal finance application engineered for global users, freelancers, and multi-currency budgeters. Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Firebase**, Hellium allows users to log expenses in over 20+ global currencies, view unified metrics converted to a custom Base Currency, set savings goals with full deposit audit histories, and visualize spending trajectory analytics.

---

## ✨ Key Features & Functionality

### 💱 Multi-Currency Conversion Engine
- **Live Exchange Rate Engine**: Fetches real-time exchange rates via the `ExchangeRate-API` with local fallback caching.
- **Dynamic Currency Conversion**: Automatically converts foreign currency expenses and goal deposits into the user's preferred **Base Currency** (USD, EUR, GBP, NGN, JPY, CAD, AUD, etc.).
- **20+ Global Currencies**: Full support for major international currencies with automatic symbol formatting.

### 📊 Dashboard & Trajectory Analytics
- **High-Level Metric Cards**: Instant views of Total Spent, Remaining Budget, Top Category, and Average Daily Spend.
- **Interactive Visualizations (Chart.js)**:
  - **Spending Trajectory Chart**: Daily cumulative spending trend line.
  - **Category Breakdown Chart**: Donut chart detailing spending by category (*Food, Transport, Utilities, Entertainment, Shopping, Other*).
  - **Currency Mix Distribution**: Visual breakdown of logged currencies prior to base conversion.
- **Isolated Monthly Budget Alerts**: Smart budget warning banner triggered when spending reaches $\ge 90\%$ of monthly cap. Budget warnings evaluate strictly against calendar month totals to avoid false alerts when viewing multi-month custom date ranges.

### 🎯 Savings Goals & Deposit History
- **Goal Setting & Target Progress**: Create financial targets with initial starting balances, category tags, and target dates.
- **Multi-Currency Goal Deposits**: Deposit funds in any currency. Foreign deposits automatically convert to the goal's target currency.
- **Chronological Audit Trail**: Each goal maintains a full deposit history modal detailing timestamps, logged amounts, and converted additions.

### 📝 Expense Management & Data Export
- **Transactions Management (CRUD)**: Log, edit, and delete expenses with title, category, date, logged currency, and base currency equivalent.
- **Date Range Presets**: Filter expenses by *This Month*, *Last Month*, *Last 30 Days*, *Last 90 Days*, *This Year*, *All Time*, or custom date ranges.
- **Pagination & Search**: Smooth 10-item table pagination and instant keyword search.
- **One-Click CSV Export**: Download filtered transaction logs formatted directly as `.csv` files for offline auditing.

### 🛡️ Security & Offline Sync
- **Strict Firestore Scoping**: Production Firestore security rules (`firestore.rules`) enforcing data isolation per authenticated user (`request.auth.uid == userId`).
- **Cloud & Local Offline Resilience**: Dual-layer architecture combining real-time Firestore `onSnapshot` listeners with `localStorage` fallbacks.
- **Live Sync Badge**: Header status badge displaying real-time `Cloud Synced` (emerald) or `Offline / Local` (amber) connectivity status.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Client Components)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Custom *Noble Glow* Deep Space dark aesthetic)
- **Authentication**: Firebase Auth (Google OAuth & Email/Password)
- **Database**: Firebase Firestore
- **Data Visualization**: Chart.js (`react-chartjs-2`)
- **Icons & UI**: Lucide React
- **Typography**: Google Fonts (*Montserrat* for brand/headings, *Inter* for tables/body)

---

## 📁 Project Structure

```
Hellium/
├── firestore.rules              # Production Firestore security rules
├── public/                      # Static assets & brand logos
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── dashboard/page.tsx   # Dashboard analytics & charts
│   │   ├── goals/page.tsx       # Savings goals & deposit logs
│   │   ├── login/page.tsx       # User authentication page (with auto-redirect)
│   │   ├── profile/page.tsx     # User profile & account metadata
│   │   ├── settings/page.tsx    # Base currency & monthly budget settings
│   │   ├── signup/page.tsx      # User registration page
│   │   ├── transactions/page.tsx# Transactions table, pagination & CSV export
│   │   ├── layout.tsx           # Root layout & font provider
│   │   └── page.tsx             # Public landing page & live converter demo
│   ├── components/              # Modular UI components & modals
│   │   ├── AppShell.tsx         # Responsive application shell
│   │   ├── CategoryChart.tsx    # Chart.js donut chart component
│   │   ├── ContributionModal.tsx# Multi-currency deposit modal
│   │   ├── DateRangePicker.tsx  # Flexible date range preset selector
│   │   ├── DepositHistoryModal.tsx # Deposit audit trail modal
│   │   ├── ExpenseModal.tsx     # Add/Edit expense modal
│   │   ├── GoalModal.tsx        # Add/Edit financial goal modal
│   │   ├── MetricCard.tsx       # Reusable analytics card
│   │   ├── ProtectedRoute.tsx   # Client-side auth route guard
│   │   ├── Sidebar.tsx          # Responsive navigation sidebar & sync badge
│   │   └── SpendingTrendChart.tsx # Chart.js line chart component
│   ├── context/
│   │   └── AuthContext.tsx      # Firebase auth provider & profile listener
│   ├── lib/
│   │   └── firebase.ts          # Firebase app, auth, and DB initialization
│   ├── services/
│   │   ├── exchangeRate.ts      # Live & fallback currency conversion engine
│   │   ├── expenseService.ts   # Firestore & localStorage expense CRUD
│   │   └── goalService.ts      # Firestore & localStorage goal CRUD
│   └── types/
│       ├── expense.ts           # Expense & currency TypeScript definitions
│       └── goal.ts              # Financial goal & deposit TypeScript definitions
└── tsconfig.json                # TypeScript compiler configuration
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** or **yarn**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/hellium.git
cd hellium
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and insert your Firebase Web Configuration keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🚀 Netlify Deployment Guide

Hellium includes a pre-configured [`netlify.toml`](./netlify.toml) file ready for Next.js 14 App Router deployment:

1. **Push Repository to GitHub / GitLab / Bitbucket**.
2. **Import to Netlify**:
   - Log into [Netlify.com](https://app.netlify.com).
   - Click **"Add new site"** $\rightarrow$ **"Import an existing project"**.
   - Select your Hellium repository.
3. **Configure Environment Variables**:
   - In **Site Settings** $\rightarrow$ **Environment variables**, add your Firebase keys:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. **Deploy**:
   - Click **Deploy Site**. Netlify will use `@netlify/plugin-nextjs` to build and serve your application.

---

## 🔒 Firestore Security Rules Setup

To deploy the user data isolation security rules to Firebase:

```bash
firebase deploy --only firestore:rules
```
Or paste the contents of [`firestore.rules`](./firestore.rules) into the **Rules** tab of your Firebase Console.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
