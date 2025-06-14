
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCswgQzqdWkxNqpSfTNP5VWKwVhsLmqxbI",
  authDomain: "undercover-game-9c437.firebaseapp.com",
  projectId: "undercover-game-9c437",
  storageBucket: "undercover-game-9c437.firebasestorage.app",
  messagingSenderId: "825889959648",
  appId: "1:825889959648:web:172e1001fd872d1b69ea85"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const signInAnonymous = () => signInAnonymously(auth);
