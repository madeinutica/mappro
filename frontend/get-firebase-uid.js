// Get Firebase UID for eflorez@newyorksash.com
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env' });

// Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

async function getFirebaseUID() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log('Signing in with eflorez@newyorksash.com...');

    const userCredential = await signInWithEmailAndPassword(
      auth,
      'eflorez@newyorksash.com',
      'password123'
    );

    console.log('✅ Sign in successful!');
    console.log('Firebase UID:', userCredential.user.uid);
    console.log('Email:', userCredential.user.email);
    console.log('Email verified:', userCredential.user.emailVerified);

    // Sign out
    await auth.signOut();
    console.log('Signed out');

  } catch (error) {
    console.error('❌ Sign in failed:', error.message);
  }
}

getFirebaseUID();