import { VoidCallbackPayload, DownloadTaskStartType, DownloadTaskUpdateType, ValuePayload, SetSettingPayload, GetSettingPayload, DownloadTaskMetaDataPayload, SetSongTagsPayload, YtdlDownloadUpdatePayload } from '../../electron/electronNativeApi'
import { settingsKey } from '../sharedEnums';
import { IJsApi, YoutubeVideoMetaData } from './IJsApi';

interface JsExposedApi {
    send(channel: 'startDownloadTask', params: DownloadTaskStartType): void;
    send(channel: 'abortDownload', params: VoidCallbackPayload): void;
    send(channel: 'getSetting', params: GetSettingPayload): void;
    send(channel: 'setSetting', params: SetSettingPayload): void;
    send(channel: 'showFileInExplorer', params: ValuePayload): void;
    send(channel: 'setSongTags', params: SetSongTagsPayload): void;
    send(channel: 'openFolderPicker', params: VoidCallbackPayload): void;
    receive(channel: 'downloadTaskMetaData', callback: (data: DownloadTaskMetaDataPayload) => void): void;
    receive(channel: 'downloadTaskProgress', callback: (data: DownloadTaskUpdateType) => void): void;
    receive(channel: 'downloadTaskDownloaded', callback: (data: VoidCallbackPayload) => void): void;
    receive(channel: 'downloadTaskFinished', callback: (data: ValuePayload) => void): void;
    receive(channel: 'voidCallback', callback: (data: VoidCallbackPayload) => void): void;
    receive(channel: 'getSetting', callback: (data: ValuePayload) => void): void;
    receive(channel: 'openFolderPicker', callback: (data: ValuePayload) => void): void;
    receive(channel: 'onYtdlUpdateCheck', callback: (data: ValuePayload) => void): void;
    receive(channel: 'onYtdlData', callback: (data: YtdlDownloadUpdatePayload) => void): void;
    receive(channel: 'onYtdlUpdateComplete', callback: (data: ValuePayload) => void): void;
    receive(channel: 'onYtdlVersionCheckComplete', callback: (data: ValuePayload) => void): void;
}

declare global {
    interface Window { 
        api?: JsExposedApi;
    }
}

class ElectronJsApi implements IJsApi {
    private callbacks: {[callbackId: string]: { resolve: Function, reject: Function }} = {};
    private onDataCallbacks: {[callbackId: string]: (percentageComplete: number) => void} = {};
    private ytdlUpdateCallbacks: {[variant: string]: (resolvedSize: number) => void} = {};
    private ytdlUpdates: { onCheckingForUpdates: () => void; onYtdlVersionCheckComplete: (totalSize: number) => void; onComplete: () => void; } | undefined;

    constructor () {
        window.api?.receive('downloadTaskMetaData', (message) => {
            console.log(message);
            this.callbacks[`meta-data-${message.callbackId}`].resolve(message.metaData);
            delete this.callbacks[`meta-data-${message.callbackId}`];
        });
        window.api?.receive('downloadTaskProgress', (message) => {
            console.log(message);
            this.onDataCallbacks[message.callbackId]?.(message.percentageComplete);
            if (message.percentageComplete === 1 && this.onDataCallbacks[message.callbackId]) {
                delete this.onDataCallbacks[message.callbackId];
            }
        });
        window.api?.receive('downloadTaskDownloaded', (message) => {
            console.log(message);
            this.callbacks[`downloaded-${message.callbackId}`].resolve();
            delete this.callbacks[`downloaded-${message.callbackId}`];
        });
        window.api?.receive('downloadTaskFinished', (message) => {
            console.log(message);
            this.callbacks[message.callbackId].resolve(message.value);
            delete this.callbacks[message.callbackId];
        });

        window.api?.receive('voidCallback', (message) => {
            console.log(message);
            this.callbacks[message.callbackId].resolve();
            delete this.callbacks[message.callbackId];
        });
        window.api?.receive('getSetting', (message) => {
            console.log(message);
            this.callbacks[message.callbackId]?.resolve(message.value);
            delete this.callbacks[message.callbackId];
        });
        window.api?.receive('openFolderPicker', (message) => {
            console.log(message);
            this.callbacks[message.callbackId]?.resolve(message.value);
            delete this.callbacks[message.callbackId];
        });

        window.api?.receive('onYtdlUpdateCheck', (message) => {
            this.ytdlUpdates?.onCheckingForUpdates();
        });
        window.api?.receive('onYtdlVersionCheckComplete', (message) => {
            this.ytdlUpdates?.onYtdlVersionCheckComplete(message.value);
        });
        window.api?.receive('onYtdlData', (message) => {
            this.ytdlUpdateCallbacks[message.variantName]?.(message.resolvedLength);
        });
        window.api?.receive('onYtdlUpdateComplete', (message) => {
            this.ytdlUpdates?.onComplete();
        });
    }

    public addYtdlDependencyListeners(
        onCheckingForUpdates: () => void,
        onYtdlVersionCheckComplete: (totalDownloadSize: number) => void,
        onYtdlData: (resolvedSize: number) => void,
        onYtdlpData: (resolvedSize: number) => void,
        onComplete: () => void
    ) {
        this.ytdlUpdates = {
            onCheckingForUpdates,
            onYtdlVersionCheckComplete,
            onComplete,
        }
        this.ytdlUpdateCallbacks['youtube-dl.exe'] = onYtdlData;
        this.ytdlUpdateCallbacks['yt-dlp.exe'] = onYtdlpData;
    }

    public removeYtdlDependencyListeners() {
        delete this.ytdlUpdates;
        this.ytdlUpdateCallbacks = {};
    }

    public startDownloadTask(
        videoUrl: string
    ) {
        const callbackId = this.generateCallbackId();
        return {
            taskFinished: new Promise<string>((resolve, reject) => {
                this.callbacks[callbackId] = { resolve, reject };
                window.api?.send('startDownloadTask', { videoUrl, callbackId })
            }),
            metaData: new Promise<YoutubeVideoMetaData>((resolve, reject) => {
                this.callbacks[`meta-data-${callbackId}`] = { resolve, reject };
            }),
            downloaded: new Promise<void>((resolve, reject) => {
                this.callbacks[`downloaded-${callbackId}`] = { resolve, reject };
            }),
            onData: ((onDataHandler: (percentageComplete: number) => void) => {
                this.onDataCallbacks[callbackId] = onDataHandler;
            }),
            callbackId
        };
    }

    public openFileInExplorer(mp3Path: string) {
        window.api?.send('showFileInExplorer', { callbackId: this.generateCallbackId(), value: mp3Path });
    };

    public abortDownload(callbackId: string) {
        window.api?.send('abortDownload', { callbackId })
    }

    public setSongTags(callbackId: string, songTitle: string, artistName: string, thumbnailUrl: string) {
        window.api?.send('setSongTags', { callbackId, songTitle, artistName });
    }

    public getSetting(settingKey: settingsKey) {
        return new Promise<string>((resolve, reject) => {
            if (window.api) {
                const callbackId = this.generateCallbackId();
                this.callbacks[callbackId] = { resolve, reject };
                window.api.send('getSetting', { callbackId, settingKey })
            }
            else {
                resolve(localStorage.getItem(settingKey) || '');
            }
        });
    }

    public setSetting(settingKey: settingsKey, value: any) {
        return new Promise<void>((resolve, reject) => {
            if (window.api) {
                const callbackId = this.generateCallbackId();
                this.callbacks[callbackId] = { resolve, reject };
                window.api.send('setSetting', { callbackId, settingKey, value })
            }
            else {
                localStorage.setItem(settingKey, value);
                resolve();
            }
        });
    }

    public openFolderPicker() {
        return new Promise<string>((resolve, reject) => {
            const callbackId = this.generateCallbackId();
            this.callbacks[callbackId] = { resolve, reject };
            window.api?.send('openFolderPicker', { callbackId })
        });
    }

    private generateCallbackId() {
        return (Math.random() + 1).toString(36).substring(2);
    }

	public getPlatForm(): 'capacitor' | 'electron' {
		return 'electron';
	}
}


const electronJsApi = new ElectronJsApi();
export { electronJsApi };