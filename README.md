# Tweep Web - Social Link Sharing Platform

A modern web application for saving, organizing, and sharing links from messaging platforms like WhatsApp, iMessage, and social media. Built with React and Supabase for a seamless link management experience.

## 🚀 Features

- **Smart Link Detection**: Automatically categorizes links as articles, videos, podcasts, music, or social media
- **Rich Metadata Extraction**: Fetches titles, descriptions, and images from shared URLs
- **Friend Management**: Add friends and track who shared which links
- **Advanced Filtering**: Search and filter links by type, friend, or content
- **Duplicate Prevention**: Prevents saving the same link twice
- **Responsive Design**: Works beautifully on desktop and mobile
- **Accessibility First**: Built with Base UI for screen reader support and keyboard navigation

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Base UI** - Unstyled, accessible UI components from the creators of Radix and Material UI
- **CSS3** - Custom styling with modern CSS features and animations

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Supabase Auth** - User authentication and session management
- **Row Level Security (RLS)** - Database-level security policies

### Content Detection & Processing
- **Multiple CORS Proxies** - Reliable metadata extraction from any URL
- **Smart Content Categorization** - Detects 50+ platforms including:
  - **Music**: Spotify, Apple Music, YouTube Music, SoundCloud, Bandcamp
  - **Video**: YouTube, Vimeo, Netflix, TikTok, Twitch
  - **Social**: Twitter/X, Instagram, LinkedIn, TikTok, Reddit
  - **Podcasts**: Apple Podcasts, Spotify Shows, Google Podcasts
  - **Articles**: Medium, Substack, news sites

### Development Tools
- **Create React App** - Zero-config React development environment
- **ESLint** - Code linting and formatting
- **npm** - Package management

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Supabase account (free tier available)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tweep-web.git
   cd tweep-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings → API to get your project URL and anon key
   - Run the SQL schema from `src/config/supabase.sql` in your Supabase SQL editor

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The app uses the following main tables:

- **profiles** - User profile information
- **links** - Saved links with metadata and categorization
- **friendships** - Friend relationships between users
- **recommendations** - Link sharing between friends

All tables include Row Level Security policies for data protection.

## 🎨 UI Components

Built with [Base UI](https://github.com/mui/base-ui) for:
- **Accessibility**: ARIA attributes, screen reader support, keyboard navigation
- **Flexibility**: Unstyled components with complete design control
- **Quality**: Enterprise-grade components from the Material UI team

## 🔧 Available Scripts

- **`npm start`** - Start development server
- **`npm test`** - Run test suite
- **`npm run build`** - Build for production
- **`npm run eject`** - Eject from Create React App (not recommended)

## 📱 Platform Support

### Music Platforms
- Spotify (tracks, albums, playlists)
- Apple Music
- YouTube Music
- SoundCloud
- Bandcamp
- Deezer, Tidal, Pandora

### Video Platforms
- YouTube (all formats)
- Vimeo, Dailymotion
- Netflix, Amazon Prime, Disney+
- TikTok, Instagram Reels
- Twitch clips and VODs

### Social Media
- Twitter/X posts and profiles
- Instagram posts and profiles
- LinkedIn posts and profiles
- Reddit posts and communities
- Facebook, Pinterest, Snapchat

### Podcast Platforms
- Apple Podcasts
- Spotify Shows
- Google Podcasts
- Overcast, Pocket Casts
- Stitcher, Castbox

## 🚀 Deployment

The app can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `build` folder
- **GitHub Pages**: Use the `gh-pages` package
- **AWS S3**: Upload the build folder to an S3 bucket

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Base UI](https://github.com/mui/base-ui) - Accessible UI components
- [Supabase](https://supabase.com) - Backend and database
- [Create React App](https://github.com/facebook/create-react-app) - React development environment
