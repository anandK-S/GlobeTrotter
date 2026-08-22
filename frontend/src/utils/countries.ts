export interface CountryInfo {
  name: string;
  code: string;
  dialCode: string;
  currency: string;
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'India', code: 'IN', dialCode: '+91', currency: 'INR', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', currency: 'USD', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', currency: 'GBP', flag: '🇬🇧' },
  { name: 'France', code: 'FR', dialCode: '+33', currency: 'EUR', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', dialCode: '+49', currency: 'EUR', flag: '🇩🇪' },
  { name: 'Japan', code: 'JP', dialCode: '+81', currency: 'JPY', flag: '🇯🇵' },
  { name: 'Australia', code: 'AU', dialCode: '+61', currency: 'AUD', flag: '🇦🇺' },
  { name: 'Canada', code: 'CA', dialCode: '+1', currency: 'CAD', flag: '🇨🇦' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', currency: 'AED', flag: '🇦🇪' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', currency: 'SGD', flag: '🇸🇬' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', currency: 'CHF', flag: '🇨🇭' },
  { name: 'Italy', code: 'IT', dialCode: '+39', currency: 'EUR', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', dialCode: '+34', currency: 'EUR', flag: '🇪🇸' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', currency: 'IDR', flag: '🇮🇩' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', currency: 'BRL', flag: '🇧🇷' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', currency: 'ZAR', flag: '🇿🇦' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', currency: 'EUR', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', currency: 'NZD', flag: '🇳🇿' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', currency: 'THB', flag: '🇹🇭' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', currency: 'MXN', flag: '🇲🇽' }
];

export function getCountryByName(name: string): CountryInfo {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || COUNTRIES[0];
}
