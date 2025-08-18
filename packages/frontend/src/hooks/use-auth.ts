"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { AuthError, User as SupabaseUser } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  // Load initial auth state and set up auth listener
  useEffect(() => {
    const initializeAuth = async () => {
      if (!isSupabaseConfigured) {
        // Demo mode - no persistent auth
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    if (isSupabaseConfigured) {
      // Listen for auth changes only if Supabase is configured
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            setAuthState({
              user: null,
              supabaseUser: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
    
    return () => {}; // Return cleanup function for demo mode too
  }, []);

  // Load user profile from profiles table
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          roles (
            name
          )
        `)
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        setAuthState({
          user: null,
          supabaseUser,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }

      const userProfile: UserProfile = {
        id: supabaseUser.id,
        email: profile?.email || supabaseUser.email || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        role: (profile?.roles as any)?.name || 'Driver',
      };

      setAuthState({
        user: userProfile,
        supabaseUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setAuthState({
        user: null,
        supabaseUser,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  };

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (!isSupabaseConfigured) {
        // Demo mode - simulate successful login
        console.log("Demo login:", credentials.email);
        const mockUser: UserProfile = {
          id: 'demo-user-id',
          email: credentials.email,
          firstName: 'Demo',
          lastName: 'User',
          role: 'Driver'
        };
        
        setAuthState({
          user: mockUser,
          supabaseUser: null,
          isAuthenticated: true,
          isLoading: false,
        });
        
        router.push("/dashboard");
        return { success: true };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        router.push("/dashboard");
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login failed:", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Login failed" 
      };
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (!isSupabaseConfigured) {
        // Demo mode - simulate successful registration
        console.log("Demo registration:", userData);
        const mockUser: UserProfile = {
          id: 'demo-user-' + Date.now(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        };
        
        setAuthState({
          user: mockUser,
          supabaseUser: null,
          isAuthenticated: true,
          isLoading: false,
        });
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
        
        return { success: true };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          }
        }
      });
      
      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        // The trigger will automatically create the profile
        // Wait a moment for the trigger to complete
        setTimeout(async () => {
          await loadUserProfile(data.user!);
          router.push("/dashboard");
        }, 1000);
        
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("Registration failed:", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Registration failed" 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAuthState({
        user: null,
        supabaseUser: null,
        isAuthenticated: false,
        isLoading: false,
      });
      router.push("/");
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    supabase, // Export supabase client for direct use if needed
  };
}
