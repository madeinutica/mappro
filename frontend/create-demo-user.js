// Create Demo User in Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createDemoUser() {
  try {
    console.log('Creating demo user eflorez@newyorksash.com...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'eflorez@newyorksash.com',
      'password123'
    );

    console.log('✅ Demo user created successfully!');
    console.log('Email:', userCredential.user.email);
    console.log('UID:', userCredential.user.uid);

    console.log('\nYou can now test authentication with:');
    console.log('Email: eflorez@newyorksash.com');
    console.log('Password: password123');

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Demo user already exists!');
      console.log('You can test authentication with:');
      console.log('Email: eflorez@newyorksash.com');
      console.log('Password: password123');
    } else {
      console.error('❌ Error creating demo user:', error.message);
    }
  }
}

createDemoUser();