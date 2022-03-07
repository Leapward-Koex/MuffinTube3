import https from 'https';
import fetch from 'node-fetch';
import fs, { constants as fsConstants } from 'fs';
import { app } from 'electron'
import path from 'path';
import storage from 'electron-json-storage'

export interface GitHubReleaseAsset {
    browser_download_url: string,
    content_type: string,
    name: string
}
export interface GitHubRelease {
    published_at: string,
    id: number,
    name: string,
    tag_name: string,
    assets: GitHubReleaseAsset[]
}

export class GitHubManager {

    public async downloadAssetFromRelease(release: GitHubRelease, assetName: 'youtube-dl.exe' | 'yt-dlp.exe') {
        const latestWindowsBinary = release.assets.find((asset) => asset.name === assetName);
        const destinationPath = path.join(app.getAppPath(), 'electron', 'ytdl', assetName)
        return new Promise<void>((resolve, reject) => {
            fetch(latestWindowsBinary.browser_download_url).then((response) => {
                const fileStream = fs.createWriteStream(destinationPath);
                response.body.on('error', reject);
                fileStream.on('finish', resolve);
                response.body.pipe(fileStream);
            });
        })
    }

    public getReleases(repoPath: '/repos/ytdl-org/youtube-dl/releases' | '/repos/yt-dlp/yt-dlp/releases') {
        return new Promise<GitHubRelease[]>((resolve, reject) => {
            https.get({
                host: 'api.github.com',
                headers: {'User-Agent': 'request'},
                path: repoPath,
            }, (response) => {
                const { statusCode } = response;
                const contentType = response.headers['content-type'];
    
                let error;
                // Any 2xx status code signals a successful response but
                console.log('hello')
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
                }
                else if (!/^application\/json/.test(contentType)) {
                    error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
                }
                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    response.resume();
                    reject(error.message);
                    return;
                }
    
                response.setEncoding('utf8');
                let rawData = '';
                response.on('data', (chunk) => { rawData += chunk; });
                response.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    }
                    catch (e) {
                        reject(e.message);
                    }
                });
            }).on('error', (e) => {
                reject(e.message);
            });
        })
    }
}
