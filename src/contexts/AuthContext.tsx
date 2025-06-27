'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { AuthContextType, AuthState, User, LoginCredentials, SignupCredentials } from '@/types/auth.types';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/authService';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { data: session, status } = useSession();
  const { showSuccess, showError } = useToast();

  // Sync with NextAuth session
  useEffect(() => {
    if (status === 'loading') {
      dispatch({ type: 'SET_LOADING', payload: true });
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Only update if user data has actually changed
      const newUserId = session.user._id;
      if (state.user?.id !== newUserId) {
        const user: User = {
          id: session.user._id,
          _id: session.user._id,
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image,
          user_interests: [],
          community_joined: [],
          is_creator: false,
          custom_feeds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(session.user as any), // Include any additional fields
        };
        dispatch({ type: 'SET_USER', payload: user });
      }
    } else if (state.user !== null) {
      dispatch({ type: 'SET_USER', payload: null });
    }
  }, [session, status, state.user?.id]);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      showSuccess('Successfully logged in!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      showError(message);
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await authService.signup({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      // After successful signup, sign in the user
      await login({
        email: credentials.email,
        password: credentials.password,
      });

      showSuccess('Account created successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      showError(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      dispatch({ type: 'LOGOUT' });
      showSuccess('Successfully logged out!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      showError(message);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!state.user) throw new Error('No user logged in');

      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedUser = await authService.updateProfile(state.user.id, data);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      showSuccess('Profile updated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      showError(message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (!state.user) return;

      const updatedUser = await authService.getProfile(state.user.id);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const contextValue: AuthContextType = React.useMemo(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    signup,
    updateProfile,
    refreshUser,
  }), [state.user, state.isAuthenticated, state.isLoading, login, logout, signup, updateProfile, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 