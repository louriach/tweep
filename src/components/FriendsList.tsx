import React, { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../App';

interface FriendsListProps {
  session: Session;
}

interface Friend {
  id: string;
  friend_id: string;
  friend_email: string;
  friend_name: string;
  created_at: string;
}

const FriendsList: React.FC<FriendsListProps> = ({ session }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          created_at,
          friend:profiles!friendships_friend_id_fkey(
            id,
            email,
            full_name
          )
        `)
        .eq('user_id', session.user.id);

      if (error) throw error;

      const friendsData = data?.map((friendship: any) => ({
        id: friendship.id,
        friend_id: friendship.friend_id,
        friend_email: (friendship.friend as any)?.email || '',
        friend_name: (friendship.friend as any)?.full_name || '',
        created_at: friendship.created_at,
      })) || [];

      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const addFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendEmail.trim()) return;

    setAddingFriend(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', newFriendEmail.trim())
        .single();

      if (userError || !userData) {
        throw new Error('User not found. Make sure they have an account.');
      }

      if (userData.id === session.user.id) {
        throw new Error("You can't add yourself as a friend.");
      }

      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('friend_id', userData.id)
        .single();

      if (existingFriendship) {
        throw new Error('This person is already your friend.');
      }

      // Create friendship
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert([
          {
            user_id: session.user.id,
            friend_id: userData.id,
          },
        ]);

      if (friendshipError) throw friendshipError;

      // Add to local state
      setFriends([
        ...friends,
        {
          id: `temp-${Date.now()}`,
          friend_id: userData.id,
          friend_email: userData.email,
          friend_name: userData.full_name,
          created_at: new Date().toISOString(),
        },
      ]);

      setNewFriendEmail('');
      setSuccessMessage('Friend added successfully!');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setAddingFriend(false);
    }
  };

  const removeFriend = async (friendshipId: string, friendName: string) => {
    if (!window.confirm(`Remove ${friendName} from your friends?`)) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setFriends(friends.filter(friend => friend.id !== friendshipId));
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading friends...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Friends ({friends.length})</h2>
        
        <form onSubmit={addFriend} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="friend-email-input" className="block text-sm font-medium text-gray-700 mb-2">
              Friend's email address
            </label>
            <input
              type="email"
              id="friend-email-input"
              placeholder="Friend's email address"
              value={newFriendEmail}
              onChange={(e) => setNewFriendEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={addingFriend || !newFriendEmail.trim()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {addingFriend ? 'Adding...' : 'Add Friend'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
            {successMessage}
          </div>
        )}
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">👥</div>
          <p className="text-gray-600">No friends added yet. Add friends to see their shared links!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend) => (
            <div key={friend.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                    {friend.friend_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{friend.friend_name}</h3>
                    <p className="text-gray-600 text-sm">{friend.friend_email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFriend(friend.id, friend.friend_name)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Remove friend"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-500 text-sm">
                Friends since {formatDate(friend.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
        <ul className="text-gray-700 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            Add friends by their email address (they need to have an account)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            When saving links, you can specify which friend shared it
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            Filter your links by friend to see what each person has shared
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            Friends can see links you've recommended to them
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FriendsList; 