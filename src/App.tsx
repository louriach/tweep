import React, { useState, useEffect } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Temporary auth bypass flag - set to true to skip authentication
const SKIP_AUTH = false;

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (SKIP_AUTH) {
      // Create a mock session for development
      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: '00000000-0000-4000-8000-000000000001', // Valid UUID format
          aud: 'authenticated',
          role: 'authenticated',
          email: 'dev@example.com',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: {
            provider: 'email',
            providers: ['email']
          },
          user_metadata: {
            full_name: 'Development User'
          },
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      setSession(mockSession);
      setLoading(false);
      return;
    }

    // Normal auth flow (when SKIP_AUTH is false)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return <Dashboard session={session} />;
}

export default App;
