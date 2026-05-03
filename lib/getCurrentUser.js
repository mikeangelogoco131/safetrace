import { supabase } from './supabaseClient';

// Returns { user, session } - uses getSession() as the primary method
export async function getUserOrSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (data?.session) {
      return { user: data.session.user, session: data.session };
    }
  } catch (err) {
    console.warn('getSession() error:', err);
  }

  // Fallback to getUser() if getSession() didn't work
  try {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      return { user: data.user, session: null };
    }
  } catch (err) {
    console.warn('getUser() error:', err);
  }

  return { user: null, session: null };
}

export async function getCurrentUser() {
  const { user } = await getUserOrSession();
  return user;
}

export async function getCurrentSession() {
  const { session } = await getUserOrSession();
  return session;
}
