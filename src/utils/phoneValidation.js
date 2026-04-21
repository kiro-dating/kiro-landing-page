import { parsePhoneNumber, isValidPhoneNumber, ParseError } from 'libphonenumber-js';

/**
 * Maps the internal country code format (e.g. "+1_CA") to the ISO 3166-1 alpha-2 code ("CA")
 * that libphonenumber-js expects.
 */
const extractCountryISO = (countryCode) => {
  if (!countryCode) return null;
  // Format: "+1_CA" → "CA", "+509_HT" → "HT"
  const parts = countryCode.split('_');
  return parts.length > 1 ? parts[parts.length - 1] : null;
};

/**
 * Countries sharing the North American Numbering Plan (+1).
 * libphonenumber-js may resolve these to "US" even for CA numbers,
 * so we allow either country code when both share the +1 prefix.
 */
const NANP_COUNTRIES = new Set(['US', 'CA', 'PR', 'BS', 'BB', 'AG', 'AI', 'TC', 'VG', 'VI', 'KY', 'BM', 'GD', 'MS', 'KN', 'LC', 'VC', 'TT', 'DM', 'DO', 'JM']);

/**
 * Validates a phone number for a given country.
 *
 * @param {string} phone - Raw phone input from the user
 * @param {string} countryCode - Internal country code format, e.g. "+1_CA"
 * @returns {{ isValid: boolean, formatted: string|null, error: string|null }}
 */
export const validatePhoneNumber = (phone, countryCode) => {
  // Handle empty / null / undefined
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return {
      isValid: false,
      formatted: null,
      error: 'Le numéro de téléphone est requis',
    };
  }

  const countryISO = extractCountryISO(countryCode);
  if (!countryISO) {
    return {
      isValid: false,
      formatted: null,
      error: 'Pays non reconnu',
    };
  }

  try {
    const parsed = parsePhoneNumber(phone, countryISO);

    if (!parsed || !parsed.isValid()) {
      return {
        isValid: false,
        formatted: null,
        error: 'Numéro invalide pour ce pays',
      };
    }

    // For NANP countries (US/CA/etc.) sharing the +1 prefix,
    // libphonenumber may resolve to a sibling country — this is valid.
    // For all other countries, enforce a strict country match.
    const parsedCountry = parsed.country;
    const isNANP = NANP_COUNTRIES.has(countryISO);
    const countryMismatch =
      parsedCountry &&
      parsedCountry !== countryISO &&
      !(isNANP && NANP_COUNTRIES.has(parsedCountry));

    if (countryMismatch) {
      return {
        isValid: false,
        formatted: null,
        error: 'Numéro invalide pour ce pays',
      };
    }

    return {
      isValid: true,
      formatted: parsed.format('E.164'), // e.g. "+15141234567"
      error: null,
    };
  } catch (err) {
    if (err instanceof ParseError) {
      return {
        isValid: false,
        formatted: null,
        error: 'Numéro invalide pour ce pays',
      };
    }
    return {
      isValid: false,
      formatted: null,
      error: 'Numéro invalide pour ce pays',
    };
  }
};
