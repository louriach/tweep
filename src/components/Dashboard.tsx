import React, { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../App';
import AddLink from './AddLink';
import LinkList from './LinkList';
import FriendsList from './FriendsList';

interface DashboardProps {
  session: Session;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'links' | 'friends'>('links');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const getUserProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createUserProfile();
        } else {
          throw error;
        }
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [session.user.id]);

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  const createUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: session.user.id,
            full_name: session.user.user_metadata.full_name || session.user.email,
            email: session.user.email,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleLinkAdded = () => {
    // Trigger refresh of LinkList by updating the refresh key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">LinkShare</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {userProfile?.full_name || session.user.email}</span>
            <button 
              onClick={handleSignOut} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'links'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('links')}
            >
              My Links
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'friends'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('friends')}
            >
              Friends
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'links' ? (
          <div className="space-y-8">
            <AddLink session={session} onLinkAdded={handleLinkAdded} />
            <LinkList session={session} refreshKey={refreshKey} />
          </div>
        ) : (
          <FriendsList session={session} />
        )}
      </main>
    </div>
  );
};

export default Dashboard; 