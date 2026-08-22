/**
 * Global Currency and Formatting Utilities
 */

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AED: 'AED ',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  JPY: '¥',
  CHF: 'CHF ',
  NZD: 'NZ$',
  THB: '฿',
  BRL: 'R$',
  ZAR: 'R ',
  MXN: 'Mex$'
};

export function getCurrencySymbol(currency: string = 'USD'): string {
  const upper = currency.toUpperCase();
  return CURRENCY_SYMBOLS[upper] || `${upper} `;
}

export function formatCurrency(amount: number = 0, currency: string = 'USD'): string {
  const upper = (currency || 'USD').toUpperCase();
  const symbol = getCurrencySymbol(upper);
  
  if (upper === 'INR') {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }
  
  return `${symbol}${amount.toLocaleString()}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
