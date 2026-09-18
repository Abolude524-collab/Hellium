export interface FinanceTip {
  id: string;
  title: string;
  category: 'Budgeting' | 'Multi-Currency' | 'Savings' | 'Smart Spending' | 'Debt & Wealth';
  summary: string;
  detail: string;
  actionableStep: string;
  iconName?: string;
  isContextual?: boolean;
}

export const STATIC_FINANCE_TIPS: FinanceTip[] = [
  {
    id: 'tip-50-30-20',
    title: 'The 50/30/20 Budgeting Rule',
    category: 'Budgeting',
    summary: 'Allocate 50% to Needs, 30% to Wants, and 20% to Savings.',
    detail:
      'Divide your post-tax income into three buckets: 50% for essential needs (rent, utilities, groceries), 30% for discretionary wants (dining out, entertainment), and 20% dedicated to building savings or paying down debt.',
    actionableStep: 'Review your monthly expenses and ensure non-essentials remain within 30%.',
  },
  {
    id: 'tip-fx-dcc',
    title: 'Avoid Dynamic Currency Conversion (DCC)',
    category: 'Multi-Currency',
    summary: 'Always choose to pay in the LOCAL currency when card processing abroad.',
    detail:
      'When paying by credit/debit card in a foreign country, payment terminals often ask whether to charge in your home currency or local currency. Choosing your home currency triggers exorbitant markup rates (DCC). Always pick the local currency to let your bank handle conversion at interbank rates.',
    actionableStep: 'Press "Local Currency" at POS terminals to save 3-7% on foreign transaction markups.',
  },
  {
    id: 'tip-emergency-fund',
    title: 'Build a 3-to-6 Month Emergency Shield',
    category: 'Savings',
    summary: 'Maintain 3 to 6 months of essential living expenses in liquid savings.',
    detail:
      'Before aggressively investing or making major purchases, keep a safety cushion in a high-yield account in your base currency. This protects you against job market shifts, medical emergencies, or unexpected travel needs.',
    actionableStep: 'Set up an automated monthly transfer to your dedicated emergency savings vault.',
  },
  {
    id: 'tip-24hr-rule',
    title: 'The 24-Hour Cooling Off Rule',
    category: 'Smart Spending',
    summary: 'Wait 24 hours before completing any unplanned purchase over $50.',
    detail:
      'Impulse buying triggers emotional spending spikes. By forcing a mandatory 24-hour delay on non-essential items, emotional impulse fades and you evaluate purchases with logic.',
    actionableStep: 'Bookmark non-essential items in a wish list for 24 hours before clicking Buy.',
  },
  {
    id: 'tip-pay-yourself-first',
    title: 'Pay Yourself First',
    category: 'Savings',
    summary: 'Automate savings on payday before spending money on discretionary items.',
    detail:
      'Instead of saving whatever happens to be left at the end of the month, transfer your savings target on the exact day your income lands. Treat your future self as your top priority bill.',
    actionableStep: 'Schedule automatic transfers to savings on your regular deposit dates.',
  },
  {
    id: 'tip-subscriptions-audit',
    title: 'Conduct a Quarterly Subscription Audit',
    category: 'Smart Spending',
    summary: 'Unsubscribe from recurring software, streaming, and app services you rarely use.',
    detail:
      'Small monthly subscriptions in different currencies quietly drain your budget over time. Review your transaction table for recurring small charges.',
    actionableStep: 'Cancel at least one unused recurring monthly subscription today.',
  },
];

/**
 * Generate contextual personal finance tips based on real user spending metrics
 */
export function getContextualFinanceTips(
  totalSpent: number,
  monthlyBudget: number,
  baseCurrency: string,
  topCategory: string,
  expensesCount: number
): FinanceTip[] {
  const tips: FinanceTip[] = [];
  const budgetUsage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  // High budget usage alert tip
  if (budgetUsage >= 80) {
    tips.push({
      id: 'context-budget-high',
      title: `Budget Usage at ${Math.round(budgetUsage)}% (${baseCurrency})`,
      category: 'Smart Spending',
      summary: `You have consumed ${Math.round(budgetUsage)}% of your monthly limit.`,
      detail: `Your total spending (${totalSpent.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}) is approaching your monthly cap of ${monthlyBudget.toLocaleString('en-US', { style: 'currency', currency: baseCurrency })}. Pause non-essential purchases for the remainder of the month to protect your target.`,
      actionableStep: 'Filter transactions by Wants and defer optional shopping until next month.',
      isContextual: true,
    });
  }

  // Top category spending alert tip
  if (topCategory && topCategory !== 'None') {
    tips.push({
      id: 'context-top-category',
      title: `Optimize Your "${topCategory}" Spending`,
      category: 'Smart Spending',
      summary: `"${topCategory}" is currently your highest frequency expense category.`,
      detail: `Your transaction patterns show heavy logging in ${topCategory}. Setting a sub-budget for ${topCategory} can free up substantial monthly room in ${baseCurrency}.`,
      actionableStep: `Set a specific limit for ${topCategory} expenses this month.`,
      isContextual: true,
    });
  }

  // Active tracking milestone tip
  if (expensesCount >= 5) {
    tips.push({
      id: 'context-milestone',
      title: 'Great Tracking Habit!',
      category: 'Budgeting',
      summary: `You have logged ${expensesCount} multi-currency transactions.`,
      detail: 'Consistent tracking is proven to reduce monthly impulse spending by over 15%. Keep logging foreign and local expenses as they happen!',
      actionableStep: 'Review your weekly spending trend chart on the dashboard to spot patterns.',
      isContextual: true,
    });
  }

  return tips;
}
