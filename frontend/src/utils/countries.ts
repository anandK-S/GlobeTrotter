export interface CountryInfo {
  name: string;
  code: string;
  dialCode: string;
  currency: string;
  phoneLengths: number[];
  placeholder: string;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'India', code: 'IN', dialCode: '+91', currency: 'INR', phoneLengths: [10], placeholder: '9876543210 (10 digits)' },
  { name: 'United States', code: 'US', dialCode: '+1', currency: 'USD', phoneLengths: [10], placeholder: '2025550143 (10 digits)' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', currency: 'GBP', phoneLengths: [10, 11], placeholder: '7911123456 (10-11 digits)' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', currency: 'AED', phoneLengths: [9], placeholder: '501234567 (9 digits)' },
  { name: 'Australia', code: 'AU', dialCode: '+61', currency: 'AUD', phoneLengths: [9], placeholder: '412345678 (9 digits)' },
  { name: 'Canada', code: 'CA', dialCode: '+1', currency: 'CAD', phoneLengths: [10], placeholder: '4165550198 (10 digits)' },
  { name: 'Germany', code: 'DE', dialCode: '+49', currency: 'EUR', phoneLengths: [10, 11], placeholder: '15123456789 (10-11 digits)' },
  { name: 'France', code: 'FR', dialCode: '+33', currency: 'EUR', phoneLengths: [9], placeholder: '612345678 (9 digits)' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', currency: 'SGD', phoneLengths: [8], placeholder: '81234567 (8 digits)' },
  { name: 'Japan', code: 'JP', dialCode: '+81', currency: 'JPY', phoneLengths: [10, 11], placeholder: '9012345678 (10-11 digits)' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', currency: 'CHF', phoneLengths: [9], placeholder: '791234567 (9 digits)' },
  { name: 'Italy', code: 'IT', dialCode: '+39', currency: 'EUR', phoneLengths: [9, 10], placeholder: '3201234567 (9-10 digits)' },
  { name: 'Spain', code: 'ES', dialCode: '+34', currency: 'EUR', phoneLengths: [9], placeholder: '612345678 (9 digits)' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', currency: 'IDR', phoneLengths: [9, 10, 11, 12], placeholder: '81234567890 (9-12 digits)' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', currency: 'BRL', phoneLengths: [10, 11], placeholder: '11987654321 (10-11 digits)' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', currency: 'ZAR', phoneLengths: [9], placeholder: '821234567 (9 digits)' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', currency: 'EUR', phoneLengths: [9], placeholder: '612345678 (9 digits)' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', currency: 'NZD', phoneLengths: [8, 9, 10], placeholder: '211234567 (8-10 digits)' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', currency: 'THB', phoneLengths: [9], placeholder: '812345678 (9 digits)' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', currency: 'MXN', phoneLengths: [10], placeholder: '5512345678 (10 digits)' }
];

export function getCountryByName(name: string): CountryInfo {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || COUNTRIES[0];
}

export function getMaxPhoneLength(countryName: string): number {
  const country = getCountryByName(countryName);
  return Math.max(...country.phoneLengths);
}

export function validatePhoneNumber(phone: string, countryName: string): { isValid: boolean; message: string } {
  const cleanDigits = phone.replace(/[^0-9]/g, '');
  const country = getCountryByName(countryName);
  
  if (!cleanDigits) {
    return { isValid: false, message: 'Phone number is required.' };
  }

  if (country.phoneLengths.includes(cleanDigits.length)) {
    return { isValid: true, message: `Valid ${country.name} phone number (${cleanDigits.length} digits).` };
  }

  const expectedStr = country.phoneLengths.join(' or ');
  return {
    isValid: false,
    message: `${country.name} numbers must be exactly ${expectedStr} digits (${cleanDigits.length} entered).`
  };
}
