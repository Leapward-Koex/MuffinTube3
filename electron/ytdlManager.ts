import fs, { constants as fsConstants } from 'fs';
import { app } from 'electron'
import path from 'path';
import storage from 'electron-json-storage'
import { GitHubManager } from './gitHubManager';
import log from 'electron-log'

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
        log.info('Checking for ytdl updates');
        const [latestYtdlReleases, latestYtdlpReleases] = await Promise.all([this.gitHubManager.getReleases('/repos/ytdl-org/youtube-dl/releases'), this.gitHubManager.getReleases('/repos/yt-dlp/yt-dlp/releases')]);
        const latestYtdlRelease = latestYtdlReleases[0];
        const latestYtdlpRelease = latestYtdlpReleases[0];

        const [installedYtdlVersion, installedYtdlpVersion] = await Promise.all([this.getInstalledYtdlVersion(YtdlVariant.ytdl), this.getInstalledYtdlVersion(YtdlVariant.ytdlp)]);
        log.info(`Installed ytdl version: ${JSON.stringify(installedYtdlVersion)}, installed ytdlp version: ${JSON.stringify(installedYtdlpVersion)}`);

        const downloadTasks: Promise<void>[] = [];
        if (!installedYtdlVersion.version || latestYtdlRelease.tag_name !== installedYtdlVersion.version) {
            // Classic YTDL
            log.info(`Going to update ytdl, latest version: ${latestYtdlRelease.tag_name}`);
            downloadTasks.push(this.gitHubManager.downloadAssetFromRelease(latestYtdlRelease, 'youtube-dl.exe'));
        }
        if (!installedYtdlpVersion.version || latestYtdlpRelease.tag_name !== installedYtdlVersion.version) {
            // Forked YTDLP
            log.info(`Going to update ytdlp, latest version: ${latestYtdlpRelease.tag_name}`);
            downloadTasks.push(this.gitHubManager.downloadAssetFromRelease(latestYtdlpRelease, 'yt-dlp.exe'));
        }
        await Promise.all(downloadTasks);
        await this.saveYtdlVersion(YtdlVariant.ytdl, latestYtdlRelease.tag_name);
        await this.saveYtdlVersion(YtdlVariant.ytdlp, latestYtdlpRelease.tag_name);
    }

    private getInstalledYtdlVersion(ytdpVariant: YtdlVariant) {
        log.info(`Getting installed ytdl version for ${ytdpVariant}`);
        return new Promise<{version?: string}>((resolve, reject) => {
            storage.get(ytdpVariant, (error, data) => {
                if (error) {
                    reject(data);
                }
                const ytdlPath = path.join(app.getPath('userData'), 'binaries', 'ytdl', 'youtube-dl.exe');
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
        log.info(`Saving ytdl version - key: ${key} = ${version}`);
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