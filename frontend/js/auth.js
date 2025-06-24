import { supabase } from './config.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.currentUser = session.user;
      this.updateAuthUI();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        this.currentUser = session.user;
        this.updateAuthUI();
        // Redirect to main page if on login page
        if (window.location.pathname.includes('login.html')) {
          window.location.href = 'index.html';
        }
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.updateAuthUI();
        // Redirect to login page
        window.location.href = 'login.html';
      }
    });
  }

  async signIn() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  updateAuthUI() {
    const authButton = document.getElementById('authButton');
    if (authButton) {
      if (this.currentUser) {
        authButton.textContent = 'Sign Out';
        authButton.onclick = () => this.signOut();
      } else {
        authButton.textContent = 'Sign In';
        authButton.onclick = () => this.signIn();
      }
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export const auth = new AuthManager();