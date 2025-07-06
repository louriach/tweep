import React, { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../App';

interface LinkListProps {
  session: Session;
  refreshKey?: number;
}

interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  image_url: string;
  type: 'article' | 'video' | 'podcast' | 'social' | 'other';
  shared_by: string | null;
  created_at: string;
}

const LinkList: React.FC<LinkListProps> = ({ session, refreshKey }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'article' | 'video' | 'podcast' | 'social' | 'music' | 'other'>('all');
  const [friendFilter, setFriendFilter] = useState('');

  const fetchLinks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Debug: Log the first few links to see what metadata we have
      if (data && data.length > 0) {
        console.log('Sample link data:', data[0]);
        console.log('Title:', data[0].title);
        console.log('Description:', data[0].description);
      }
      
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  }, [session.user.id]);

  const filterLinks = useCallback(() => {
    let filtered = [...links];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(link => link.type === typeFilter);
    }

    // Friend filter
    if (friendFilter) {
      filtered = filtered.filter(link =>
        link.shared_by?.toLowerCase().includes(friendFilter.toLowerCase())
      );
    }

    setFilteredLinks(filtered);
  }, [links, searchTerm, typeFilter, friendFilter]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks, refreshKey]);

  useEffect(() => {
    filterLinks();
  }, [filterLinks]);

  const deleteLink = async (linkId: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId)
        .eq('user_id', session.user.id);

      if (error) throw error;
      
      setLinks(links.filter(link => link.id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'podcast': return '🎧';
      case 'article': return '📰';
      case 'social': return '📱';
      case 'music': return '🎵';
      default: return '🔗';
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
    return <div className="loading">Loading links...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">My Saved Links ({filteredLinks.length})</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="podcast">Podcasts</option>
            <option value="social">Social</option>
            <option value="music">Music</option>
            <option value="other">Other</option>
          </select>
          
          <input
            type="text"
            placeholder="Filter by friend..."
            value={friendFilter}
            onChange={(e) => setFriendFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">🔗</div>
          <p className="text-gray-600">
            {links.length === 0 ? (
              'No links saved yet. Add your first link above!'
            ) : (
              'No links match your current filters.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => (
            <div key={link.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded-full">
                  {getTypeIcon(link.type)} {link.type}
                </span>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Delete link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {link.image_url && (
                <img
                  src={link.image_url}
                  alt=""
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {link.title && link.title.trim() && link.title !== new URL(link.url).hostname 
                      ? link.title 
                      : `Link from ${new URL(link.url).hostname}`}
                  </a>
                </h3>
                
                {link.description && 
                 link.description.trim() && 
                 link.description !== 'Link shared by friend' && 
                 link.description !== '' && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{link.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>{formatDate(link.created_at)}</span>
                  {link.shared_by && link.shared_by.trim() && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Shared by {link.shared_by}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-400 truncate">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title={link.url}
                    className="hover:text-gray-600 transition-colors"
                  >
                    {link.url.length > 60 ? `${link.url.substring(0, 60)}...` : link.url}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkList; 