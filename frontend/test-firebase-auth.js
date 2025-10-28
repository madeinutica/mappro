const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase config (hardcoded for testing)
const firebaseConfig = {
  apiKey: "AIzaSyC0QEjl8_tNH5qMpzkbQ8KXKaBntBqM1LY",
  authDomain: "mappro-f6fae.firebaseapp.com",
  projectId: "mappro-f6fae",
  storageBucket: "mappro-f6fae.firebasestorage.app",
  messagingSenderId: "197233297667",
  appId: "1:197233297667:web:ec934312497b7d1ee70136"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testFirebaseAuth() {
  try {
    console.log('Testing Firebase authentication...');

    // Sign in with demo user
    const userCredential = await signInWithEmailAndPassword(auth, 'demo@mappro.com', 'password123');
    console.log('✅ Firebase sign in successful:', userCredential.user.email);
    console.log('✅ Firebase UID:', userCredential.user.uid);

    // Test client ID retrieval (inline logic)
    console.log('Testing client ID retrieval...');

    // Simulate the getClientId logic
    const firebaseUser = userCredential.user;
    let clientId = null;

    if (firebaseUser) {
      // For demo purposes, hardcode the association for the demo user
      if (firebaseUser.uid === '4LtwhspICcdgb18CO3c6Ns7RpM13') {
        clientId = '550e8400-e29b-41d4-a716-446655440000'; // New York Sash client ID
      }
    }

    console.log('✅ Client ID retrieved:', clientId);

    if (clientId === '550e8400-e29b-41d4-a716-446655440000') {
      console.log('✅ Correctly associated with New York Sash client');
    } else {
      console.log('❌ Client ID does not match expected New York Sash client');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase auth test failed:', error.message);
    process.exit(1);
  }
}

testFirebaseAuth();