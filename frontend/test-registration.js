// Test registration functionality
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';
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

// Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testRegistration() {
  try {
    console.log('Testing user registration...');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Generate a test email
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testCompany = 'Test Company';

    console.log(`Creating test user: ${testEmail}`);

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Firebase user created:', userCredential.user.uid);

    // Create client in Supabase
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: testCompany,
        domain: 'testcompany.com',
        firebase_uid: userCredential.user.uid
      })
      .select()
      .single();

    if (clientError) {
      console.error('❌ Error creating client:', clientError);
    } else {
      console.log('✅ Client created:', newClient);
    }

    // Verify the association
    const { data: verifyClient, error: verifyError } = await supabase
      .from('clients')
      .select('id, name, firebase_uid')
      .eq('firebase_uid', userCredential.user.uid)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying client:', verifyError);
    } else {
      console.log('✅ Client verification successful:', verifyClient);
    }

    // Clean up - delete the test user
    await deleteUser(userCredential.user);
    console.log('🧹 Test user cleaned up');

    // Clean up - delete the test client
    if (newClient) {
      await supabase.from('clients').delete().eq('id', newClient.id);
      console.log('🧹 Test client cleaned up');
    }

  } catch (error) {
    console.error('❌ Registration test failed:', error);
  }
}

testRegistration();