import { create } from 'zustand';
import { signIn, signOut } from 'next-auth/react'; // Import signIn and signOut

interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<{ success: boolean; error: string | null }>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  fetchUser: async () => {
    set({ loading: true });
    // This will be handled by the SessionProvider and useSession hook in components
    // For the store, we can just set loading to false initially
    set({ loading: false });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const result = await signIn('credentials', {
        redirect: false, // Do not redirect, handle response manually
        email,
        password,
      });

      if (result?.error) {
        console.error('Sign-in error:', result.error);
        
        // Map common NextAuth errors to user-friendly messages
        let userFriendlyError = result.error;
        
        if (result.error === 'CredentialsSignin') {
          userFriendlyError = 'Invalid email or password. Please check your credentials and try again.';
        } else if (result.error.includes('No account found')) {
          userFriendlyError = 'No account found with this email address. Please sign up first.';
        } else if (result.error.includes('Invalid password')) {
          userFriendlyError = 'Incorrect password. Please try again.';
        } else if (result.error.includes('verify your email address')) {
          userFriendlyError = 'Please verify your email address before signing in.';
        } else if (result.error.includes('Email and password are required')) {
          userFriendlyError = 'Please enter both email and password.';
        }
        
        return { success: false, error: userFriendlyError };
      }

      // If sign-in is successful, you might want to refetch the session or update user state
      // For now, we'll rely on components using useSession to get the updated state
      return { success: true, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during sign-in. Please try again.';
      console.error('Sign-in exception:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    try {
      // This will be an API call to your own /api/auth/signup route
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

  const data = await response.json();

      if (!response.ok) {
        console.error('Sign-up error:', data.error);
        
        // Map common sign-up errors to user-friendly messages
        let userFriendlyError = data.error || 'Sign-up failed';
        
        if (data.error === 'User with this email already exists') {
          userFriendlyError = 'An account with this email already exists. Please sign in instead.';
        } else if (data.error === 'Missing required fields') {
          userFriendlyError = 'Please fill in all required fields.';
        } else if (data.error.includes('email')) {
          userFriendlyError = 'Please enter a valid email address.';
        } else if (data.error.includes('password')) {
          userFriendlyError = 'Password must be at least 6 characters long.';
        }
        
        return { success: false, error: userFriendlyError };
      }

      return { success: true, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      console.error('Sign-up exception:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await signOut({ redirect: false }); // Do not redirect, handle response manually
      set({ user: null, session: null }); // Clear state
      return { success: true, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Sign-out exception:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },
}));

// fetchUser is not called on store initialization anymore as useSession will handle it
// in components.
// useAuthStore.getState().fetchUser();