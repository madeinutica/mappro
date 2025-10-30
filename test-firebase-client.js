// Test Firebase authentication and client association
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getClientId } from './auth.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8Q8p7Z8Q8p7Z8Q8p7Z8Q8p7Z8Q8p7Z8Q",
  authDomain: "mapro-demo.firebaseapp.com",
  projectId: "mapro-demo",
  storageBucket: "mapro-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testFirebaseAuth() {
  try {
    console.log('🔐 Testing Firebase authentication...');

    // Note: This is a placeholder - you'll need actual Firebase credentials
    console.log('⚠️  Please provide valid Firebase credentials to test authentication');
    console.log('   The Firebase UID "ibEEqGoyOOXeAbBg7QIREWmWa523" should be associated with New York Sash client');

    // Test the client ID lookup logic
    console.log('🔍 Testing client ID lookup for Firebase UID: ibEEqGoyOOXeAbBg7QIREWmWa523');

    // Mock Firebase user for testing
    const mockFirebaseUser = {
      uid: 'ibEEqGoyOOXeAbBg7QIREWmWa523'
    };

    // Temporarily mock the auth.currentUser
    const originalCurrentUser = auth.currentUser;
    auth.currentUser = mockFirebaseUser;

    const clientId = await getClientId();
    console.log('📋 Client ID result:', clientId);

    if (clientId) {
      console.log('✅ Client association successful!');
      console.log('🏢 User can access New York Sash client data');
    } else {
      console.log('❌ Client association failed');
      console.log('💡 Make sure the Firebase UID is properly associated in the database');
    }

    // Restore original currentUser
    auth.currentUser = originalCurrentUser;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFirebaseAuth();