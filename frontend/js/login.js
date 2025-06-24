import { auth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-btn');
  
  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      try {
        await auth.signIn();
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
      }
    });
  }

  // Check if user is already authenticated
  if (auth.isAuthenticated()) {
    window.location.href = 'index.html';
  }
});