
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const createDefaultProfile = (userId: string): Profile => {
    console.log('Creating default profile for user:', userId);
    return {
      id: userId,
      is_admin: false,
      first_name: '',
      last_name: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      farm_size_acres: null,
      location_coordinates: null,
      location_district: null,
      phone_number: null,
      phone_verified: null,
      preferred_language: null,
      primary_crops: null,
      role: null
    };
  };

  const fetchProfileWithTimeout = async (userId: string): Promise<Profile> => {
    console.log('fetchProfileWithTimeout starting for user:', userId);
    
    // Create a promise that rejects after 10 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.log('Profile fetch timed out after 10 seconds');
        reject(new Error('Profile fetch timeout'));
      }, 10000);
    });

    // Create the actual fetch promise
    const fetchPromise = new Promise<Profile>(async (resolve, reject) => {
      try {
        console.log('Executing Supabase profile query...');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        console.log('Profile query result - Data:', data, 'Error:', error);

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('Profile not found, creating default profile');
            // Profile doesn't exist, create a fallback
            resolve(createDefaultProfile(userId));
          } else {
            console.error('Profile query error:', error);
            reject(error);
          }
        } else {
          console.log('Profile fetched successfully:', data);
          resolve(data);
        }
      } catch (err) {
        console.error('Unexpected error in profile fetch:', err);
        reject(err);
      }
    });

    try {
      // Race between the fetch and timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('Profile fetch completed successfully');
      return result;
    } catch (error) {
      console.error('Profile fetch failed or timed out:', error);
      // Always return a default profile on any error
      console.log('Returning default profile due to error/timeout');
      return createDefaultProfile(userId);
    }
  };

  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('=== AUTH STATE CHANGE ===');
    console.log('Event:', event);
    console.log('Session user:', session?.user?.email || 'No session');
    console.log('Current loading state:', loading);
    
    try {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User is authenticated, starting profile fetch...');
        const startTime = Date.now();
        
        const profileData = await fetchProfileWithTimeout(session.user.id);
        
        const endTime = Date.now();
        console.log(`Profile fetch completed in ${endTime - startTime}ms`);
        console.log('Setting profile data:', profileData);
        
        setProfile(profileData);
        console.log('Profile set successfully');
      } else {
        console.log('No user session, clearing profile');
        setProfile(null);
      }
    } catch (error) {
      console.error('Critical error in handleAuthStateChange:', error);
      // Even on error, create a basic profile if we have a user
      if (session?.user) {
        console.log('Creating emergency fallback profile');
        const fallbackProfile = createDefaultProfile(session.user.id);
        setProfile(fallbackProfile);
      }
    } finally {
      console.log('Setting loading to false - auth state change complete');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== AUTH PROVIDER INITIALIZING ===');
    
    let mounted = true;
    let initializationComplete = false;

    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      if (!initializationComplete && mounted) {
        console.warn('EMERGENCY: Auth initialization taking too long, forcing loading to false');
        setLoading(false);
      }
    }, 15000); // 15 second emergency timeout

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log('Component unmounted, ignoring auth state change');
          return;
        }
        await handleAuthStateChange(event, session);
        if (!initializationComplete) {
          initializationComplete = true;
          clearTimeout(emergencyTimeout);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('Component unmounted during session check');
          return;
        }
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          initializationComplete = true;
          clearTimeout(emergencyTimeout);
          return;
        }
        
        console.log('Initial session retrieved, processing...');
        await handleAuthStateChange('INITIAL_SESSION', session);
        
        if (!initializationComplete) {
          initializationComplete = true;
          clearTimeout(emergencyTimeout);
        }
      } catch (error) {
        console.error('Critical error in auth initialization:', error);
        if (mounted) {
          setLoading(false);
          initializationComplete = true;
          clearTimeout(emergencyTimeout);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('AuthProvider cleanup');
      mounted = false;
      clearTimeout(emergencyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
    setProfile(null);
  };

  const contextValue = {
    user,
    session,
    profile,
    loading,
    signOut
  };

  console.log('=== AUTH PROVIDER RENDER ===');
  console.log('Loading:', loading);
  console.log('User:', user?.email || 'none');
  console.log('Profile loaded:', !!profile);
  console.log('Profile ID:', profile?.id || 'none');

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
