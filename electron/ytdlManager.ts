import fs, { constants as fsConstants } from 'fs';
import { app } from 'electron'
import path from 'path';
import storage from 'electron-json-storage'
import { GitHubManager } from './gitHubManager';

export enum YtdlVariant {
    ytdl = 'ytdl',
    ytdlp = 'ytdlp',
}

export class YtdlManager {
    gitHubManager: GitHubManager;

    constructor() {
        this.gitHubManager = new GitHubManager();
    }


    public async checkForUpdate() {
        debugger;
        const [latestYtdlReleases, latestYtdlpReleases] = await Promise.all([this.gitHubManager.getReleases('/repos/ytdl-org/youtube-dl/releases'), this.gitHubManager.getReleases('/repos/yt-dlp/yt-dlp/releases')]);
        const latestYtdlRelease = latestYtdlReleases[0];
        const latestYtdlpRelease = latestYtdlpReleases[0];

        const [installedYtdlVersion, installedYtdlpVersion] = await Promise.all([this.getInstalledYtdlVersion(YtdlVariant.ytdl), this.getInstalledYtdlVersion(YtdlVariant.ytdlp)]);

        const downloadTasks: Promise<void>[] = [];
        if (!installedYtdlVersion.version || latestYtdlRelease.tag_name !== installedYtdlVersion.version) {
            // Classic YTDL
            downloadTasks.push(this.gitHubManager.downloadAssetFromRelease(latestYtdlRelease, 'youtube-dl.exe'));
        }
        if (!installedYtdlpVersion.version || latestYtdlpRelease.tag_name !== installedYtdlVersion.version) {
            // Forked YTDLP
            downloadTasks.push(this.gitHubManager.downloadAssetFromRelease(latestYtdlpRelease, 'yt-dlp.exe'));
        }
        await Promise.all(downloadTasks);
        await this.saveYtdlVersion(YtdlVariant.ytdl, latestYtdlRelease.tag_name);
        await this.saveYtdlVersion(YtdlVariant.ytdlp, latestYtdlpRelease.tag_name);
    }

    private getInstalledYtdlVersion(ytdpVariant: YtdlVariant) {
        return new Promise<{version?: string}>((resolve, reject) => {
            storage.get(ytdpVariant, (error, data) => {
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

    private saveYtdlVersion(key: string, version: string) {
        return new Promise<void>((resolve, reject) => {
            storage.set(key, { version }, (error) => {
                if (error) {
                    reject();
                    return;
                }
                resolve();
            });
        });
    }
}