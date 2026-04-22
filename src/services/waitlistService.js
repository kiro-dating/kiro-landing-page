import { supabase } from '../lib/supabaseClient';

const DUPLICATE_WAITLIST_CODE = 'DUPLICATE_WAITLIST_ENTRY';

const inferDuplicateField = (error) => {
  const details = `${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`;

  if (details.includes('waitlist_users_email_normalized_idx')) {
    return 'email';
  }

  if (details.includes('waitlist_users_phone_idx')) {
    return 'phone';
  }

  return 'unknown';
};

/**
 * Adds a new entry to the waitlist_users table.
 * @param {{ email: string, phone: string, country: string, age: string, gender: string }} data
 */
export const addToWaitlist = async (data) => {
  const normalizedEmail = data.email.trim().toLowerCase();
  const { error } = await supabase
    .from('waitlist_users')
    .insert([{
      ...data,
      email: normalizedEmail,
      source: 'landing_page',
      status: 'pending',
    }]);

  if (!error) {
    return;
  }

  if (error.code === '23505') {
    const duplicateField = inferDuplicateField(error);
    const duplicateError = new Error('Duplicate waitlist entry');
    duplicateError.code = DUPLICATE_WAITLIST_CODE;
    duplicateError.duplicateField = duplicateField;
    duplicateError.cause = error;
    throw duplicateError;
  }

  throw error;
};

export { DUPLICATE_WAITLIST_CODE };
