# Railway Deployment Guide

## Quick Deploy Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Commit Changes
Make sure all the following files are committed to your git repository:
- `.gitignore` (updated to allow yt-dlp binary)
- `railway.toml` (Railway configuration)
- `install-ytdlp.sh` (yt-dlp installation script)
- `server.js` (updated with health check and error handling)
- `package.json` (updated with postinstall script)
- `yt-dlp` (Linux binary - will be downloaded by install script)

```bash
git add .
git commit -m "Add Railway deployment configuration and fixes"
git push
```

### 3. Deploy to Railway
Railway will automatically:
1. Run `npm install` which triggers the `postinstall` script
2. Download the latest yt-dlp binary via `install-ytdlp.sh`
3. Set execute permissions on yt-dlp
4. Build your Vite frontend with `npm run build`
5. Start the server with `npm start`

### 4. Verify Deployment
Once deployed, test the health check endpoint:
```
https://your-railway-app.railway.app/api/health
```

This should return:
```json
{
  "status": "ok",
  "environment": "production",
  "platform": "linux",
  "ytdlp": {
    "path": "/app/yt-dlp",
    "exists": true,
    "executable": true,
    "size": 3170726
  }
}
```

### 5. Test Video Download
Try downloading a video through your app's UI or directly via API:
```bash
curl -X POST https://your-railway-app.railway.app/api/video-info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## Troubleshooting

### Check Railway Logs
If you encounter errors, check the Railway deployment logs:
1. Go to your Railway project dashboard
2. Click on "Deployments"
3. View the logs for detailed error messages

### Common Issues

#### yt-dlp not found
- **Symptom**: Error message "yt-dlp binary not found"
- **Solution**: Ensure `install-ytdlp.sh` ran successfully during `postinstall`. Check Railway logs for download errors.

#### Permission denied
- **Symptom**: Error message "yt-dlp binary is not executable"
- **Solution**: The server now automatically tries to set execute permissions. If this fails, check Railway logs for permission errors.

#### Video processing fails
- **Symptom**: 500 error when trying to download videos
- **Solution**: 
  - Check the health endpoint to verify yt-dlp is installed correctly
  - Review Railway logs for detailed error messages
  - Ensure the video URL is valid and accessible

### Manual yt-dlp Installation (if needed)
If the automatic installation fails, you can manually add the yt-dlp binary:

1. Download yt-dlp for Linux:
```bash
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
```

2. Make it executable:
```bash
chmod +x yt-dlp
```

3. Commit and push:
```bash
git add yt-dlp
git commit -m "Add yt-dlp binary"
git push
```

## Environment Variables (Optional)
You can set these in Railway's dashboard under "Variables":
- `NODE_ENV`: Already set to "production" in railway.toml
- `PORT`: Automatically set by Railway

## What Changed

### Files Modified
1. **`.gitignore`**: Added exception to allow yt-dlp binary
2. **`package.json`**: Added postinstall script and cross-env dependency
3. **`server.js`**: Added health check endpoint, improved error logging, and automatic permission fixing

### Files Created
1. **`railway.toml`**: Railway deployment configuration
2. **`install-ytdlp.sh`**: Script to download and configure yt-dlp
3. **`RAILWAY_DEPLOYMENT.md`**: This deployment guide

## Next Steps
After deploying, monitor your Railway logs for the first few video downloads to ensure everything works correctly.
