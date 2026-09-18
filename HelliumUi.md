# UI & Design Specifications: Hellium

## 1. Design Aesthetic
*   **Theme:** Dark mode by default. Minimalist, clean, and highly readable. Avoid visual clutter; rely on whitespace for separation.
*   **Typography:** Use `Montserrat` for headings and primary brand elements to create a sharp, modern look. Use `Inter` or standard sans-serif for dense data tables and body text to ensure maximum legibility.

## 2. Color Palette (The Noble Glow)
*   **Background:** `#0B0F19` (Deep space slate / `bg-slate-950`)
*   **Surface/Cards:** `#111827` (Rich dark gray / `bg-slate-900 border-slate-800`)
*   **Primary Accent:** `#A855F7` (Electric purple / `text-purple-500` and `bg-purple-500`)
*   **Secondary/Warning:** `#F472B6` (Neon pink / `text-pink-400` and `bg-pink-400` for over-budget alerts)
*   **Text:** `#F3F4F6` (`text-gray-100`) for primary text and headings, `#9CA3AF` (`text-gray-400`) for secondary text and labels.

## 3. Layout Structure
*   **Navigation:** A responsive sidebar (or bottom nav on mobile) containing links to: Dashboard, Transactions, Settings.
*   **Dashboard View:** 
    *   Top row: High-level metric cards (Total Spent, Remaining Budget, Base Currency).
    *   Middle section: The Chart.js category breakdown.
    *   Bottom section: A "Recent Transactions" mini-table.
*   **Forms:** Keep input fields sleek. Use dark inputs with subtle focus rings (`focus:ring-purple-500`).