
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
      first_name: null,
      last_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      farm_size_acres: null,
      location_coordinates: null,
      location_district: null,
      phone_number: null,
      phone_verified: false,
      preferred_language: 'en',
      primary_crops: null,
      role: 'farmer'
    };
  };

  const fetchProfile = async (userId: string): Promise<Profile> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, using default profile');
          return createDefaultProfile(userId);
        }
        console.error('Profile fetch error:', error);
        return createDefaultProfile(userId);
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return createDefaultProfile(userId);
    }
  };

  const handleAuthStateChange = async (session: Session | null) => {
    console.log('Auth state changed:', session ? 'authenticated' : 'unauthenticated');
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      try {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        console.log('Profile set successfully');
      } catch (error) {
        console.error('Profile fetch failed:', error);
        const defaultProfile = createDefaultProfile(session.user.id);
        setProfile(defaultProfile);
        console.log('Using default profile due to error');
      }
    } else {
      setProfile(null);
    }
    
    setLoading(false);
    console.log('Loading state set to false');
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      handleAuthStateChange(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        await handleAuthStateChange(session);
      }
    );

    return () => {
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

  console.log('AuthProvider render - Loading:', loading, 'User:', !!user, 'Profile:', !!profile);

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
