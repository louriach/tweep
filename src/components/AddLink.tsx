import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../App';

interface AddLinkProps {
  session: Session;
  onLinkAdded?: () => void;
}

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  type: 'article' | 'video' | 'podcast' | 'social' | 'music' | 'other';
}

const AddLink: React.FC<AddLinkProps> = ({ session, onLinkAdded }) => {
  const [url, setUrl] = useState('');
  const [friendName, setFriendName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const detectLinkType = (url: string, title: string, description: string): 'article' | 'video' | 'podcast' | 'social' | 'music' | 'other' => {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    // Music detection - check for music streaming platforms first
    if (
      // Spotify Music (tracks, albums, artists, playlists)
      urlLower.includes('open.spotify.com/track/') ||
      urlLower.includes('open.spotify.com/album/') ||
      urlLower.includes('open.spotify.com/artist/') ||
      urlLower.includes('open.spotify.com/playlist/') ||
      // Apple Music
      urlLower.includes('music.apple.com/') ||
      // YouTube Music
      urlLower.includes('music.youtube.com/') ||
      // Amazon Music
      urlLower.includes('music.amazon.com/albums/') ||
      urlLower.includes('music.amazon.com/artists/') ||
      urlLower.includes('music.amazon.com/playlists/') ||
      // Deezer Music
      urlLower.includes('deezer.com/track/') ||
      urlLower.includes('deezer.com/album/') ||
      urlLower.includes('deezer.com/artist/') ||
      urlLower.includes('deezer.com/playlist/') ||
      // Tidal
      urlLower.includes('tidal.com/browse/track/') ||
      urlLower.includes('tidal.com/browse/album/') ||
      urlLower.includes('tidal.com/browse/artist/') ||
      urlLower.includes('tidal.com/browse/playlist/') ||
      // SoundCloud
      urlLower.includes('soundcloud.com/') ||
      // Bandcamp
      urlLower.includes('bandcamp.com/track/') ||
      urlLower.includes('bandcamp.com/album/') ||
      // Pandora
      urlLower.includes('pandora.com/artist/') ||
      urlLower.includes('pandora.com/album/') ||
      // Last.fm
      urlLower.includes('last.fm/music/') ||
      // Generic music indicators
      titleLower.includes('song') ||
      titleLower.includes('track') ||
      titleLower.includes('album') ||
      titleLower.includes('music') ||
      descLower.includes('listen to') ||
      descLower.includes('stream')
    ) {
      return 'music';
    }

    // Social media detection - check for social platforms
    if (
      // Facebook
      urlLower.includes('facebook.com/') ||
      urlLower.includes('fb.com/') ||
      // Instagram
      urlLower.includes('instagram.com/') ||
      // Twitter/X
      urlLower.includes('twitter.com/') ||
      urlLower.includes('x.com/') ||
      // LinkedIn
      urlLower.includes('linkedin.com/in/') ||
      urlLower.includes('linkedin.com/company/') ||
      urlLower.includes('linkedin.com/posts/') ||
      // TikTok
      urlLower.includes('tiktok.com/@') ||
      urlLower.includes('tiktok.com/') ||
      // Snapchat
      urlLower.includes('snapchat.com/add/') ||
      // Pinterest
      urlLower.includes('pinterest.com/') ||
      // Reddit
      urlLower.includes('reddit.com/user/') ||
      urlLower.includes('reddit.com/r/') ||
      // Sina Weibo
      urlLower.includes('weibo.com/') ||
      // VKontakte (VK)
      urlLower.includes('vk.com/') ||
      // Douyin
      urlLower.includes('douyin.com/user/') ||
      // Telegram
      urlLower.includes('t.me/') ||
      // Threads
      urlLower.includes('threads.net/@') ||
      // Mastodon (various instances)
      (urlLower.includes('/@') && (
        urlLower.includes('mastodon.social') ||
        urlLower.includes('mastodon.online') ||
        urlLower.includes('mas.to') ||
        urlLower.includes('fosstodon.org') ||
        urlLower.includes('mstdn.social') ||
        urlLower.includes('hachyderm.io')
      )) ||
      // Tumblr
      urlLower.includes('.tumblr.com/') ||
      // Mixi
      urlLower.includes('mixi.jp/show_friend.pl') ||
      // Generic social indicators
      titleLower.includes('social') ||
      titleLower.includes('profile') ||
      descLower.includes('social media') ||
      descLower.includes('follow me')
    ) {
      return 'social';
    }

    // Podcast detection - check for major podcast platforms
    if (
      // Spotify Podcasts
      urlLower.includes('open.spotify.com/show/') ||
      urlLower.includes('open.spotify.com/episode/') ||
      // Apple Podcasts
      urlLower.includes('podcasts.apple.com/') ||
      // Google Podcasts
      urlLower.includes('podcasts.google.com/') ||
      // Amazon Music Podcasts
      urlLower.includes('music.amazon.com/podcasts/') ||
      // Stitcher
      urlLower.includes('stitcher.com/show/') ||
      urlLower.includes('stitcher.com/podcast/') ||
      // Pocket Casts
      urlLower.includes('pca.st/') ||
      // Overcast
      urlLower.includes('overcast.fm/') ||
      // Castbox
      urlLower.includes('castbox.fm/channel/') ||
      // iHeartRadio
      urlLower.includes('iheart.com/podcast/') ||
      // TuneIn
      urlLower.includes('tunein.com/podcasts/') ||
      // Podbean
      urlLower.includes('podbean.com/podcast-detail/') ||
      urlLower.includes('podbean.com/e/') ||
      // Audible
      urlLower.includes('audible.com/pd/') ||
      // Deezer
      urlLower.includes('deezer.com/show/') ||
      // Player FM
      urlLower.includes('player.fm/series/') ||
      // Generic podcast indicators
      titleLower.includes('podcast') ||
      descLower.includes('podcast')
    ) {
      return 'podcast';
    }

    // Video detection
    if (
      // YouTube - improved detection
      urlLower.includes('youtube.com') ||
      urlLower.includes('youtu.be/') ||
      // Vimeo
      urlLower.includes('vimeo.com/') ||
      // Dailymotion
      urlLower.includes('dailymotion.com/video/') ||
      // Twitch
      urlLower.includes('twitch.tv/videos/') ||
      urlLower.includes('twitch.tv/clip/') ||
      // Facebook Watch
      urlLower.includes('facebook.com/watch') ||
      urlLower.includes('fb.watch/') ||
      // Instagram Video
      urlLower.includes('instagram.com/p/') ||
      urlLower.includes('instagram.com/reel/') ||
      urlLower.includes('instagram.com/tv/') ||
      // Streaming Services
      urlLower.includes('netflix.com/watch/') ||
      urlLower.includes('amazon.com/dp/') ||
      urlLower.includes('primevideo.com/') ||
      urlLower.includes('disneyplus.com/video/') ||
      urlLower.includes('tv.apple.com/') ||
      urlLower.includes('peacocktv.com/watch/') ||
      urlLower.includes('play.max.com/video/') ||
      urlLower.includes('hbomax.com/') ||
      // UK Streaming Services
      urlLower.includes('bbc.co.uk/iplayer/') ||
      urlLower.includes('itv.com/watch/') ||
      urlLower.includes('channel4.com/programmes/') ||
      urlLower.includes('nowtv.com/watch/') ||
      urlLower.includes('britbox.com/') ||
      urlLower.includes('discoveryplus.com/') ||
      urlLower.includes('paramountplus.com/') ||
      // Generic video indicators
      titleLower.includes('video') ||
      descLower.includes('video') ||
      titleLower.includes('watch') ||
      descLower.includes('watch')
    ) {
      return 'video';
    }

    // Article detection
    if (titleLower.includes('article') || 
        descLower.includes('article') ||
        urlLower.includes('medium.com') ||
        urlLower.includes('substack.com')) {
      return 'article';
    }

    return 'other';
  };

  const extractMetadata = async (url: string): Promise<LinkMetadata> => {
    console.log('=== METADATA EXTRACTION DEBUG ===');
    console.log('Extracting metadata for:', url);
    
    // List of CORS proxy services to try
    const corsProxies = [
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    ];
    
    for (let i = 0; i < corsProxies.length; i++) {
      try {
        console.log(`Trying proxy ${i + 1}:`, corsProxies[i]);
        
        const response = await fetch(corsProxies[i], {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
          },
        });
        
        if (!response.ok) {
          console.log(`Proxy ${i + 1} failed with status:`, response.status);
          continue;
        }

        let htmlContent = '';
        
        // Different proxies return data in different formats
        if (corsProxies[i].includes('allorigins.win')) {
          const data = await response.json();
          htmlContent = data.contents;
        } else if (corsProxies[i].includes('codetabs.com')) {
          htmlContent = await response.text();
        } else if (corsProxies[i].includes('corsproxy.io')) {
          htmlContent = await response.text();
        }

        if (!htmlContent) {
          console.log(`Proxy ${i + 1} returned empty content`);
          continue;
        }

        // Parse HTML to extract metadata
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Extract title
        let title = '';
        const ogTitle = doc.querySelector('meta[property="og:title"]');
        const twitterTitle = doc.querySelector('meta[name="twitter:title"]');
        const titleTag = doc.querySelector('title');
        
        if (ogTitle) {
          title = ogTitle.getAttribute('content') || '';
        } else if (twitterTitle) {
          title = twitterTitle.getAttribute('content') || '';
        } else if (titleTag) {
          title = titleTag.textContent || '';
        }

        // Extract description
        let description = '';
        const ogDescription = doc.querySelector('meta[property="og:description"]');
        const twitterDescription = doc.querySelector('meta[name="twitter:description"]');
        const metaDescription = doc.querySelector('meta[name="description"]');
        
        if (ogDescription) {
          description = ogDescription.getAttribute('content') || '';
        } else if (twitterDescription) {
          description = twitterDescription.getAttribute('content') || '';
        } else if (metaDescription) {
          description = metaDescription.getAttribute('content') || '';
        }

        // Extract image
        let image = '';
        const ogImage = doc.querySelector('meta[property="og:image"]');
        const twitterImage = doc.querySelector('meta[name="twitter:image"]');
        
        if (ogImage) {
          image = ogImage.getAttribute('content') || '';
        } else if (twitterImage) {
          image = twitterImage.getAttribute('content') || '';
        }

        // Clean up extracted data
        title = title.trim();
        description = description.trim();

        // If we got some metadata, use it
        if (title || description) {
          // Fallback to URL hostname if no title found
          if (!title) {
            title = new URL(url).hostname;
          }

          // Fallback description
          if (!description) {
            description = 'Link shared by friend';
          }

          const type = detectLinkType(url, title, description);
          console.log(`Successfully extracted metadata using proxy ${i + 1} - type:`, type);
          console.log('Title:', title);
          console.log('Description:', description);
          
          return {
            title: title,
            description: description,
            image: image,
            type: type
          };
        }
        
        console.log(`Proxy ${i + 1} didn't return useful metadata`);
        
      } catch (error) {
        console.log(`Proxy ${i + 1} error:`, error);
        continue;
      }
    }
    
    // If all proxies failed, fall back to basic URL parsing
    console.log('All proxies failed, using fallback');
    const urlObj = new URL(url);
    const type = detectLinkType(url, urlObj.hostname, 'Link shared by friend');
    console.log('Fallback result - type:', type);
    
    return {
      title: urlObj.hostname,
      description: 'Link shared by friend',
      image: '',
      type: type
    };
  };

  const normalizeUrl = (url: string): string => {
    const trimmedUrl = url.trim();
    
    // If URL already has a protocol, return as is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    // If URL starts with www., add https://
    if (trimmedUrl.startsWith('www.')) {
      return `https://${trimmedUrl}`;
    }
    
    // If URL looks like a domain (contains a dot), add https://
    if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
      return `https://${trimmedUrl}`;
    }
    
    // Otherwise, assume it needs https://
    return `https://${trimmedUrl}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Normalize and validate URL
      const normalizedUrl = normalizeUrl(url);
      
      // Test if the normalized URL is valid
      new URL(normalizedUrl);

      // Check for duplicate links
      const { data: existingLinks, error: checkError } = await supabase
        .from('links')
        .select('id, title')
        .eq('user_id', session.user.id)
        .eq('url', normalizedUrl);

      if (checkError) throw checkError;

      if (existingLinks && existingLinks.length > 0) {
        setError(`You already have this link saved: "${existingLinks[0].title}"`);
        return;
      }

      // Extract metadata
      const metadata = await extractMetadata(normalizedUrl);

      // Save to database
      const { error } = await supabase
        .from('links')
        .insert([
          {
            url: normalizedUrl,
            title: metadata.title,
            description: metadata.description,
            image_url: metadata.image,
            type: metadata.type,
            shared_by: friendName.trim() || null,
            user_id: session.user.id,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // Reset form
      setUrl('');
      setFriendName('');
      
      // Show success message
      setSuccessMessage('Link saved successfully!');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      // Call onLinkAdded callback
      onLinkAdded?.();
      
    } catch (error: any) {
      if (error.name === 'TypeError') {
        setError('Please enter a valid URL (e.g., example.com or https://example.com)');
      } else {
        setError(error.message || 'Failed to save link');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add New Link</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="link-url" className="text-sm font-medium text-gray-700">
            Link URL
          </label>
          <input
            id="link-url"
            type="text"
            placeholder="Paste your link here (e.g., example.com, www.example.com, or https://example.com)..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base transition-all bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 focus:bg-white font-medium"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="friend-name" className="text-sm font-medium text-gray-700">
            Who shared this? (optional)
          </label>
          <input
            id="friend-name"
            type="text"
            placeholder="Friend's name"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base transition-all bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 focus:bg-white text-gray-600"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-3 py-3 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="bg-emerald-500 text-white border-0 px-6 py-3.5 rounded-lg text-base font-semibold cursor-pointer transition-all self-start hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Saving...' : 'Save Link'}
        </button>
      </form>
      {successMessage && (
        <div className="bg-green-50 text-green-700 px-3 py-3 rounded-lg border border-green-200 text-sm animate-pulse mt-5">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default AddLink; 