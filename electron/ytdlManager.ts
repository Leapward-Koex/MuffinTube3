import https from 'https';
import fetch from 'node-fetch';
import fs, { constants as fsConstants } from 'fs';
import { app } from 'electron'
import path from 'path';
import storage from 'electron-json-storage'

interface GitHubReleaseAsset {
    browser_download_url: string,
    content_type: string,
    name: string
}
interface GitHubRelease {
    published_at: string,
    id: number,
    name: string,
    tag_name: string,
    assets: GitHubReleaseAsset[]
}

export class YtdlManager {
    ytdlReleases: Promise<GitHubRelease[]>;
    private readonly ytdlVersionKey = 'ytdl-version';

    constructor() {
        this.ytdlReleases = this.getYtdlReleases();
    }

    public async installLatestVersion() {
        const latestYtdlRelease = (await this.ytdlReleases)[0];
        const latestWindowsBinary = latestYtdlRelease.assets.find((asset) => asset.name === "youtube-dl.exe");
        const destinationPath = path.join(app.getAppPath(), 'electron', 'ytdl', 'youtube-dl.exe')
        return new Promise<void>((resolve, reject) => {
            fetch(latestWindowsBinary.browser_download_url).then((response) => {
                const fileStream = fs.createWriteStream(destinationPath);
                response.body.on('error', reject);
                fileStream.on('finish', resolve);
                response.body.pipe(fileStream);
            });
        })
    }

    public async checkForUpdate() {
        const latestYtdlRelease = (await this.ytdlReleases)[0];
        const installedVersion = await this.getInstalledYtdlVersion();
        if (!installedVersion.version || latestYtdlRelease.tag_name !== installedVersion.version) {
            await this.installLatestVersion();
            await this.saveYtdlVersion(latestYtdlRelease.tag_name)
        }
    }

    private getInstalledYtdlVersion() {
        return new Promise<{version?: string}>((resolve, reject) => {
            storage.get(this.ytdlVersionKey, (error, data) => {
                if (error) {
                    reject(data);
                }
                const ytdlPath = path.join(app.getAppPath(), 'electron', 'ytdl', 'youtube-dl.exe');
                fs.access(ytdlPath, fsConstants.F_OK, (ytdlAccessError) => {
                    if (ytdlAccessError) {
                        resolve({}); // Always download if binary is missing
                        return;
                    }
                    resolve(data as any);
                });
            });
        })
    }

    private saveYtdlVersion(version: string) {
        // 'C:\\Users\\Agent 2B\\AppData\\Roaming\\MuffinTube'
        return new Promise<void>((resolve, reject) => {
            storage.set(this.ytdlVersionKey, { version }, (error) => {
                if (error) {
                    reject();
                    return;
                }
                resolve();
            });
        });
    }

    private getYtdlReleases() {
        return new Promise<GitHubRelease[]>((resolve, reject) => {
            https.get({
                host: 'api.github.com',
                headers: {'User-Agent': 'request'},
                path: '/repos/ytdl-org/youtube-dl/releases',
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