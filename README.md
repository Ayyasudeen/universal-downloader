# Universal Video Downloader

A web application to download videos from YouTube and other platforms using yt-dlp.

## Features
- Download from YouTube, Twitter, Instagram, Facebook, and 1000+ sites
- Multiple quality options
- Premium dark mode UI
- Built with Vite + React + Express

## Deployment on Railway

This app is configured for Railway deployment.

### Prerequisites
- Railway account
- GitHub repository

### Deploy Steps

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect and deploy

3. **Environment Variables** (Optional):
   - `NODE_ENV=production` (automatically set)
   - `PORT` (automatically set by Railway)

### Local Development

```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Express.js, yt-dlp
- **Deployment**: Railway

## License
MIT
