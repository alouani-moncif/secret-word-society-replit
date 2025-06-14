
import { auth, signInAnonymous } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

export class AuthService {
  constructor() {
    this.user = null;
    this.listeners = [];
  }

  init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        this.user = user;
        this.listeners.forEach(callback => callback(user));
        resolve(user);
      });
    });
  }

  async signIn() {
    try {
      const result = await signInAnonymous();
      return result.user;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  onAuthStateChange(callback) {
    this.listeners.push(callback);
    if (this.user) callback(this.user);
  }

  getCurrentUser() {
    return this.user;
  }
}

export const authService = new AuthService();
