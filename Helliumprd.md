# Product Requirements Document (PRD): Hellium

## 1. Project Overview
Hellium is a web-based personal finance application that allows users to set budgets, track expenses, and view visual analytics. The core differentiator is multi-currency support, enabling users to log expenses in various currencies and view their total budget in a unified base currency.

## 2. Tech Stack
*   **Framework:** Next.js (App Router, TypeScript)
*   **Styling:** Tailwind CSS
*   **Backend as a Service (BaaS):** Firebase (Firestore for database, Firebase Auth for user management)
*   **Data Visualization:** Chart.js (via react-chartjs-2)
*   **External API:** ExchangeRate-API (or similar free tier API for currency conversion)

## 3. Core Features & Requirements

### A. User Authentication
*   Users must be able to sign up, log in, and log out using email/password or Google Auth.
*   Data must be scoped strictly to the authenticated user.

### B. Expense Management (CRUD)
*   Users can add a new expense with the following fields: Title, Amount, Currency (dropdown), Category (dropdown), and Date.
*   Users can view a paginated or scrollable list of all expenses.
*   Users can edit or delete existing expenses.

### C. Multi-Currency & Budgeting Logic
*   Users define a "Base Currency" in their settings (e.g., USD, EUR, NGN, GBP).
*   Users can set a monthly budget limit in their base currency.
*   When an expense is logged in a foreign currency, the app fetches the current exchange rate and calculates the equivalent amount in the base currency.
*   Both the original amount and the converted base amount are saved to Firestore.

### D. Dashboard & Analytics
*   A visual overview comparing total monthly expenses against the defined budget.
*   A donut or pie chart (Chart.js) breaking down expenses by Category (e.g., Food, Transport, Utilities, Entertainment).
*   A warning state/indicator when the user exceeds 90% of their budget limit.

## 4. Database Schema (Firestore)
*   `users/{userId}`
    *   `baseCurrency`: string
    *   `monthlyBudget`: number
*   `users/{userId}/expenses/{expenseId}`
    *   `title`: string
    *   `amount`: number (original)
    *   `currency`: string (e.g., 'EUR')
    *   `convertedAmount`: number (in base currency)
    *   `category`: string
    *   `date`: timestamp