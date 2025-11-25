import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YTDLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
const YTDLP_PATH = path.join(__dirname, 'yt-dlp');

export async function ensureYtDlp() {
    // Check if yt-dlp already exists
    if (fs.existsSync(YTDLP_PATH)) {
        const stats = fs.statSync(YTDLP_PATH);
        // Check if it's executable and has reasonable size
        if (stats.size > 1000000) {
            console.log('yt-dlp already exists');
            return true;
        }
    }

    console.log('Downloading yt-dlp...');

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(YTDLP_PATH);

        https.get(YTDLP_URL, (response) => {
            // Follow redirects
            if (response.statusCode === 302 || response.statusCode === 301) {
                https.get(response.headers.location, (redirectResponse) => {
                    redirectResponse.pipe(file);

                    file.on('finish', () => {
                        file.close();
                        // Set executable permissions
                        fs.chmodSync(YTDLP_PATH, 0o755);
                        console.log('yt-dlp downloaded and made executable');
                        resolve(true);
                    });
                }).on('error', (err) => {
                    fs.unlinkSync(YTDLP_PATH);
                    console.error('Download error:', err);
                    reject(err);
                });
            } else {
                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    // Set executable permissions
                    fs.chmodSync(YTDLP_PATH, 0o755);
                    console.log('yt-dlp downloaded and made executable');
                    resolve(true);
                });
            }
        }).on('error', (err) => {
            fs.unlinkSync(YTDLP_PATH);
            console.error('Download error:', err);
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlinkSync(YTDLP_PATH);
            console.error('File write error:', err);
            reject(err);
        });
    });
}
