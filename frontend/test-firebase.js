// Test Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env' });

// Test Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

console.log('Testing Firebase configuration...');
console.log('Environment variables loaded:', {
  apiKey: firebaseConfig.apiKey ? '✅' : '❌',
  authDomain: firebaseConfig.authDomain ? '✅' : '❌',
  projectId: firebaseConfig.projectId ? '✅' : '❌'
});

// Check if all required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key] || firebaseConfig[key] === `your_${key}_here`);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration keys:', missingKeys);
  console.log('Please update your .env file with your Firebase project configuration.');
  console.log('Get these values from: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general');
  process.exit(1);
}

try {
  // Try to initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  console.log('✅ Firebase initialized successfully!');
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('Auth domain:', firebaseConfig.authDomain);

  console.log('\nNext steps:');
  console.log('1. Create a user in Firebase Authentication console');
  console.log('2. Or use the demo credentials in your app');
  console.log('3. Test the authentication flow');

} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}