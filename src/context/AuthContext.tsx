import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, authHelpers } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const initializeAuth = async () => {
            try {
                const { session: currentSession } = await authHelpers.getSession();
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, currentSession: Session | null) => {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setLoading(false);

                if (event === 'SIGNED_IN') {
                    console.log('User signed in:', currentSession?.user?.email);
                }
                if (event === 'SIGNED_OUT') {
                    console.log('User signed out');
                }
                if (event === 'PASSWORD_RECOVERY') {
                    console.log('Password recovery initiated');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, fullName?: string) => {
        try {
            const { data, error } = await authHelpers.signUp(email, password, fullName);

            if (error) {
                return { success: false, error: error.message };
            }

            // Check if email confirmation is required
            if (data.user && !data.session) {
                return {
                    success: true,
                    needsConfirmation: true
                };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await authHelpers.signIn(email, password);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await authHelpers.signOut();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await authHelpers.resetPassword(email);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            const { error } = await authHelpers.updatePassword(newPassword);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const value: AuthContextType = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
