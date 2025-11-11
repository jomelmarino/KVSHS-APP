import { supabase } from './supabase';

export interface AppUser {
  full_name: string;
  email: string;
  password: string;
  status: 'Pending' | 'Approved';
}

export const addUser = async (user: Omit<AppUser, 'status'>): Promise<AppUser> => {
  const { data, error } = await supabase
    .from('AppUsers')
    .insert({
      full_name: user.full_name,
      email: user.email,
      password: user.password,
      status: 'Pending'
    })
    .select('full_name, email, password, status')
    .single();

  if (error) throw error;
  return data;
};

export const getUserByEmail = async (email: string): Promise<AppUser | null> => {
  const { data, error } = await supabase
    .from('AppUsers')
    .select('full_name, email, password, status')
    .eq('email', email)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data;
};

export const updateUserStatus = async (email: string, status: 'Pending' | 'Approved'): Promise<void> => {
  const { error } = await supabase
    .from('AppUsers')
    .update({ status })
    .eq('email', email);
  if (error) throw error;
};


export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
  // Check if user exists
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  // Update password and set status to Pending for re-approval
  const { error } = await supabase
    .from('AppUsers')
    .update({
      password: newPassword,
      status: 'Pending'
    })
    .eq('email', email);

  if (error) throw error;
};

export interface PasswordResetOtp {
  id: string;
  email: string;
  otp: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}

export const createPasswordResetOtp = async (email: string, otp: string): Promise<PasswordResetOtp> => {
  console.log('Creating OTP for email:', email, 'OTP:', otp);

  const { data, error } = await supabase
    .from('password_reset_otps')
    .insert({
      email,
      otp,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
    })
    .select('id, email, otp, created_at, expires_at, used')
    .single();

  if (error) {
    console.error('Supabase error creating OTP:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);

    // If it's an RLS error, provide helpful message
    if (error.code === '42501' || error.message?.includes('permission')) {
      throw new Error('Database permission error. Please disable RLS for password_reset_otps table or check your Supabase policies.');
    }

    throw error;
  }

  console.log('OTP created successfully:', data);
  return data;
};

export const verifyPasswordResetOtp = async (email: string, otp: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('password_reset_otps')
    .select('id, used, expires_at')
    .eq('email', email)
    .eq('otp', otp)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return false;

  // Mark OTP as used
  const { error: updateError } = await supabase
    .from('password_reset_otps')
    .update({ used: true })
    .eq('id', data.id);

  if (updateError) throw updateError;

  return true;
};

export const cleanupExpiredOtps = async (): Promise<void> => {
  const { error } = await supabase
    .from('password_reset_otps')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) throw error;
};
