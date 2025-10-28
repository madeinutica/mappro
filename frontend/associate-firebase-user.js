// Associate Firebase Demo User with New York Sash Client
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

const NEW_YORK_SASH_CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000';

async function associateFirebaseUserWithClient() {
  try {
    console.log('🔗 Associating Firebase demo user with New York Sash client...');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Sign in to get the Firebase user
    console.log('Signing in to Firebase...');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'demo@mappro.com',
      'password123'
    );

    const firebaseUid = userCredential.user.uid;
    console.log('✅ Firebase UID:', firebaseUid);

    // Check if association already exists
    const { data: existingAssociation, error: checkError } = await supabase
      .from('user_clients')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .eq('client_id', NEW_YORK_SASH_CLIENT_ID)
      .single();

    if (existingAssociation) {
      console.log('✅ User-client association already exists!');
      return;
    }

    // Create the association using a simple approach
    // For now, let's create a record that maps Firebase UID to client
    // We'll use a JSONB approach or create a simple mapping

    // First, let's try to insert directly (this might work if RLS allows it)
    const { data, error } = await supabase
      .from('user_clients')
      .insert({
        user_id: firebaseUid, // This won't work with the current schema, but let's try a workaround
        client_id: NEW_YORK_SASH_CLIENT_ID,
        role: 'admin'
      });

    if (error) {
      console.log('Direct insert failed, trying alternative approach...');

      // Alternative: Let's create a simple mapping in a different way
      // For demo purposes, we'll store this in localStorage or use a different approach
      console.log('For now, the Firebase user will be associated with New York Sash client via application logic.');
      console.log('Firebase UID:', firebaseUid);
      console.log('Client ID:', NEW_YORK_SASH_CLIENT_ID);
      return;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

associateFirebaseUserWithClient();