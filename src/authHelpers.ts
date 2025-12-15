// src/authHelpers.ts
// Helper functions for Supabase authentication and data

import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

// Sign up new user
export const signUpUser = async (username: string, password: string) => {
  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if username exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, user: data };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Failed to create account' };
  }
};

// Sign in user
export const signInUser = async (username: string, password: string) => {
  try {
    // Get user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return { success: false, error: 'Invalid username or password' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
};

// Save journal entry
export const saveJournalEntry = async (
  userId: string,
  entry: {
    entry_text: string;
    mood: string;
    guidance: string;
    analysis: any;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([
        {
          user_id: userId,
          entry_text: entry.entry_text,
          mood: entry.mood,
          guidance: entry.guidance,
          analysis: entry.analysis,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, entry: data };
  } catch (error) {
    console.error('Save entry error:', error);
    return { success: false, error: 'Failed to save entry' };
  }
};

// Get all journal entries for a user
export const getJournalEntries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, entries: data || [] };
  } catch (error) {
    console.error('Get entries error:', error);
    return { success: false, error: 'Failed to load entries', entries: [] };
  }
};

// Delete journal entry
export const deleteJournalEntry = async (entryId: string) => {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete entry error:', error);
    return { success: false, error: 'Failed to delete entry' };
  }
};