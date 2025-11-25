import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
    const ytDlpPath = process.platform === 'win32'
        ? path.join(__dirname, 'yt-dlp.exe')
        : path.join(__dirname, 'yt-dlp');

    const exists = fs.existsSync(ytDlpPath);
    const stats = exists ? fs.statSync(ytDlpPath) : null;

    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        platform: process.platform,
        ytdlp: {
            path: ytDlpPath,
            exists: exists,
            executable: stats ? (stats.mode & fs.constants.S_IXUSR) !== 0 : false,
            size: stats ? stats.size : 0
        }
    });
});

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
}

app.post('/api/video-info', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Use Linux binary in production, Windows .exe in development
        const ytDlpPath = process.platform === 'win32'
            ? path.join(__dirname, 'yt-dlp.exe')
            : path.join(__dirname, 'yt-dlp');

        // Check if yt-dlp exists
        if (!fs.existsSync(ytDlpPath)) {
            console.error(`yt-dlp not found at: ${ytDlpPath}`);
            return res.status(500).json({
                error: 'yt-dlp binary not found. Please check deployment configuration.'
            });
        }

        // Check if yt-dlp is executable (Unix systems)
        if (process.platform !== 'win32') {
            const stats = fs.statSync(ytDlpPath);
            if ((stats.mode & fs.constants.S_IXUSR) === 0) {
                console.error(`yt-dlp is not executable at: ${ytDlpPath}`);
                // Try to make it executable
                try {
                    fs.chmodSync(ytDlpPath, 0o755);
                    console.log('Successfully set execute permissions on yt-dlp');
                } catch (chmodError) {
                    console.error('Failed to set execute permissions:', chmodError);
                    return res.status(500).json({
                        error: 'yt-dlp binary is not executable.'
                    });
                }
            }
        }

        const command = `"${ytDlpPath}" -J --no-warnings "${url}"`;
        console.log(`Executing command: ${command}`);

        const { stdout } = await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
        const info = JSON.parse(stdout);

        // Filter formats: get video+audio combined formats
        const formats = info.formats
            .filter(f => f.ext === 'mp4' && f.acodec !== 'none' && f.vcodec !== 'none')
            .map(f => ({
                url: f.url,
                ext: f.ext,
                quality: f.format_note || f.resolution || 'Unknown',
                resolution: f.resolution,
                filesize: f.filesize
            }))
            .sort((a, b) => (b.filesize || 0) - (a.filesize || 0));

        // Remove duplicates
        const uniqueFormats = formats.filter((v, i, a) =>
            a.findIndex(t => t.quality === v.quality) === i
        );

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration_string,
            uploader: info.uploader,
            formats: uniqueFormats.slice(0, 5)
        });

    } catch (error) {
        console.error('yt-dlp error:', error);
        console.error('Error details:', {
            message: error.message,
            stderr: error.stderr,
            stdout: error.stdout,
            code: error.code
        });
        res.status(500).json({
            error: 'Failed to process video. Please check the URL.',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
    }
});

// Serve index.html for all other routes in production (SPA support)
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
