// Test project loading with Firebase auth
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase config
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

// Supabase client for testing
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://fvrueabzpinhlzyrnhne.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w'
);

async function testProjectLoading() {
  try {
    console.log('Testing project loading with Firebase auth...');

    // Sign in with demo user
    const userCredential = await signInWithEmailAndPassword(auth, 'demo@mappro.com', 'password123');
    console.log('✅ Firebase sign in successful');

    // Get client ID
    const firebaseUser = userCredential.user;
    const clientId = firebaseUser.uid === '4LtwhspICcdgb18CO3c6Ns7RpM13'
      ? '550e8400-e29b-41d4-a716-446655440000'
      : null;

    console.log('✅ Client ID:', clientId);

    if (!clientId) {
      console.log('❌ No client ID found');
      return;
    }

    // Test project loading
    console.log('Loading projects for client...');
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .limit(5);

    if (error) {
      console.error('❌ Error loading projects:', error.message);
      return;
    }

    console.log(`✅ Found ${projects.length} projects for New York Sash client`);
    if (projects.length > 0) {
      console.log('Sample project:', {
        id: projects[0].id,
        name: projects[0].name,
        address: projects[0].address
      });
    }

  } catch (error) {
    console.error('❌ Project loading test failed:', error.message);
  }
}

testProjectLoading();