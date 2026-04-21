import { supabase } from '../lib/supabaseClient';

/**
 * Adds a new entry to the waitlist_users table.
 * @param {{ email: string, phone: string, country: string, age: string, gender: string }} data
 */
export const addToWaitlist = async (data) => {
  const { error } = await supabase
    .from('waitlist_users')
    .insert([{
      ...data,
      source: 'landing_page',
      status: 'pending',
    }]);

  if (error) throw error;
};
