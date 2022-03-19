import fs, { constants as fsConstants } from 'fs';
import { app, BrowserWindow } from 'electron'
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

    constructor(
        private window: BrowserWindow
    ) {
        this.gitHubManager = new GitHubManager(this.window);
    }


    public async checkForUpdate() {
        log.info('Checking for ytdl updates');
        this.window.webContents.send('onYtdlUpdateCheck', {})
        const [latestYtdlReleases, latestYtdlpReleases] = await Promise.all([this.gitHubManager.getReleases('/repos/ytdl-org/youtube-dl/releases'), this.gitHubManager.getReleases('/repos/yt-dlp/yt-dlp/releases')]);
        const latestYtdlRelease = latestYtdlReleases[0];
        const latestYtdlpRelease = latestYtdlpReleases[0];

        const [installedYtdlVersion, installedYtdlpVersion] = await Promise.all([this.getInstalledYtdlVersion(YtdlVariant.ytdl), this.getInstalledYtdlVersion(YtdlVariant.ytdlp)]);
        log.info(`Installed ytdl version: ${JSON.stringify(installedYtdlVersion)}, installed ytdlp version: ${JSON.stringify(installedYtdlpVersion)}`);

        const downloadTasks: Promise<void>[] = [];
        let totalDownloadSize = 0;
        if (!installedYtdlVersion.version || latestYtdlRelease.tag_name !== installedYtdlVersion.version) {
            // Classic YTDL
            log.info(`Going to update ytdl, latest version: ${latestYtdlRelease.tag_name}`);
            const assetDownloadTask = await this.gitHubManager.downloadAssetFromRelease(latestYtdlRelease, 'youtube-dl.exe');
            downloadTasks.push(assetDownloadTask.task);
            totalDownloadSize += assetDownloadTask.size;
        }
        if (!installedYtdlpVersion.version || latestYtdlpRelease.tag_name !== installedYtdlpVersion.version) {
            // Forked YTDLP
            log.info(`Going to update ytdlp, latest version: ${latestYtdlpRelease.tag_name}`);
            const assetDownloadTask = await this.gitHubManager.downloadAssetFromRelease(latestYtdlpRelease, 'yt-dlp.exe');
            downloadTasks.push(assetDownloadTask.task);
            totalDownloadSize += assetDownloadTask.size;
        }
        this.window.webContents.send('onYtdlVersionCheckComplete', { value: totalDownloadSize });
        await Promise.all(downloadTasks);
        await this.saveYtdlVersion(YtdlVariant.ytdl, latestYtdlRelease.tag_name);
        await this.saveYtdlVersion(YtdlVariant.ytdlp, latestYtdlpRelease.tag_name);
        this.window.webContents.send('onYtdlUpdateComplete', {})
        log.info('Checking for ytdl updates completed');
    }

    private getInstalledYtdlVersion(ytdpVariant: YtdlVariant) {
        log.info(`Getting installed ytdl version for ${ytdpVariant}`);
        const fileToCheck = ytdpVariant === YtdlVariant.ytdl ? 'youtube-dl.exe' : 'yt-dlp.exe';
        return new Promise<{version?: string}>((resolve, reject) => {
            storage.get(ytdpVariant, (error, data) => {
                if (error) {
                    reject(data);
                }
                const ytdlPath = path.join(app.getPath('userData'), 'binaries', 'ytdl', fileToCheck);
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