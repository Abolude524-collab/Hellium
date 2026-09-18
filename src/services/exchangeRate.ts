// Fallback USD-based exchange rates for offline resilience
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.77,
  NGN: 1620.0,
  JPY: 141.5,
  CAD: 1.36,
  AUD: 1.48,
  CHF: 0.85,
  CNY: 7.10,
  INR: 83.9,
  ZAR: 17.8,
  KES: 129.5,
  GHS: 15.6,
  AED: 3.67,
  BRL: 5.45,
  SGD: 1.30,
  MXN: 19.4,
  HKD: 7.80,
  NZD: 1.62,
  SEK: 10.2,
  SAR: 3.75,
  TRY: 34.1,
};

let cachedRates: Record<string, number> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes cache

/**
 * Fetch latest USD-based exchange rates from open API or local cache
 */
export async function getRates(): Promise<Record<string, number>> {
  const now = Date.now();

  if (cachedRates && now - lastFetchTime < CACHE_DURATION_MS) {
    return cachedRates;
  }

  // Check localStorage if available
  if (typeof window !== 'undefined') {
    const localData = localStorage.getItem('hellium_exchange_rates');
    const localTime = localStorage.getItem('hellium_exchange_rates_time');
    if (localData && localTime && now - Number(localTime) < CACHE_DURATION_MS) {
      try {
        cachedRates = JSON.parse(localData);
        lastFetchTime = Number(localTime);
        return cachedRates!;
      } catch (e) {
        console.warn('Failed to parse local exchange rates cache:', e);
      }
    }
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data && data.rates) {
      cachedRates = data.rates;
      lastFetchTime = now;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hellium_exchange_rates', JSON.stringify(data.rates));
        localStorage.setItem('hellium_exchange_rates_time', String(now));
      }
      return cachedRates!;
    }
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using fallback rates:', error);
  }

  cachedRates = cachedRates || FALLBACK_RATES;
  return cachedRates;
}

/**
 * Calculate rate from source currency to target currency synchronously using rate map
 */
export function calculateRateSync(
  fromCurrency: string,
  toCurrency: string,
  ratesMap: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return 1;
  const fromRate = ratesMap[fromCurrency] || FALLBACK_RATES[fromCurrency] || 1;
  const toRate = ratesMap[toCurrency] || FALLBACK_RATES[toCurrency] || 1;
  return toRate / fromRate;
}

/**
 * Compute the effective converted amount of an expense in the user's current target base currency
 */
export function getEffectiveConvertedAmount(
  amount: number,
  expenseCurrency: string,
  savedConvertedAmount: number,
  savedBaseCurrency: string,
  targetBaseCurrency: string,
  ratesMap: Record<string, number>
): number {
  if (expenseCurrency === targetBaseCurrency) {
    return amount;
  }
  if (savedBaseCurrency === targetBaseCurrency && savedConvertedAmount > 0) {
    return savedConvertedAmount;
  }
  // Re-convert using live exchange rates
  const rate = calculateRateSync(expenseCurrency, targetBaseCurrency, ratesMap);
  return Number((amount * rate).toFixed(2));
}

/**
 * Calculate rate from source currency to target currency async
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return 1;

  const rates = await getRates();
  return calculateRateSync(fromCurrency, toCurrency, rates);
}

/**
 * Convert an amount from foreign currency to target base currency
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<{ convertedAmount: number; rate: number }> {
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, rate: 1 };
  }

  const rate = await getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = Number((amount * rate).toFixed(2));
  return { convertedAmount, rate };
}
