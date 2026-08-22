export interface CountryInfo {
  name: string;
  code: string;
  dialCode: string;
  currency: string;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'India', code: 'IN', dialCode: '+91', currency: 'INR' },
  { name: 'United States', code: 'US', dialCode: '+1', currency: 'USD' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', currency: 'GBP' },
  { name: 'France', code: 'FR', dialCode: '+33', currency: 'EUR' },
  { name: 'Germany', code: 'DE', dialCode: '+49', currency: 'EUR' },
  { name: 'Japan', code: 'JP', dialCode: '+81', currency: 'JPY' },
  { name: 'Australia', code: 'AU', dialCode: '+61', currency: 'AUD' },
  { name: 'Canada', code: 'CA', dialCode: '+1', currency: 'CAD' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', currency: 'AED' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', currency: 'SGD' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', currency: 'CHF' },
  { name: 'Italy', code: 'IT', dialCode: '+39', currency: 'EUR' },
  { name: 'Spain', code: 'ES', dialCode: '+34', currency: 'EUR' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', currency: 'IDR' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', currency: 'BRL' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', currency: 'ZAR' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', currency: 'EUR' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', currency: 'NZD' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', currency: 'THB' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', currency: 'MXN' }
];

export function getCountryByName(name: string): CountryInfo {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || COUNTRIES[0];
}
