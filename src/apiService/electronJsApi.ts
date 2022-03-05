import { YtResponse } from 'youtube-dl-exec';
import { VoidCallbackPayload, DownloadTaskStartType, DownloadTaskUpdateType, ValuePayload, SetSettingPayload, GetSettingPayload, DownloadTaskMetaDataPayload } from '../../electron/electronNativeApi'

interface JsExposedApi {
    send(channel: 'startDownloadTask', params: DownloadTaskStartType): void;
    send(channel: 'abortDownload', params: VoidCallbackPayload): void;
    send(channel: 'getSetting', params: GetSettingPayload): void;
    send(channel: 'setSetting', params: SetSettingPayload): void;
    send(channel: 'showFileInExplorer', params: ValuePayload): void;
    receive(channel: 'downloadTaskMetaData', callback: (data: DownloadTaskMetaDataPayload) => void): void;
    receive(channel: 'downloadTaskProgress', callback: (data: DownloadTaskUpdateType) => void): void;
    receive(channel: 'downloadTaskDownloaded', callback: (data: VoidCallbackPayload) => void): void;
    receive(channel: 'downloadTaskFinished', callback: (data: ValuePayload) => void): void;
    receive(channel: 'voidCallback', callback: (data: VoidCallbackPayload) => void): void;
    receive(channel: 'getSetting', callback: (data: ValuePayload) => void): void;
}

declare global {
    interface Window { 
        api?: JsExposedApi;
    }
}

class ElectronJsApi {
    private callbacks: {[callbackId: string]: { resolve: Function, reject: Function }} = {};
    private onDataCallbacks: {[callbackId: string]: (percentageComplete: number) => void} = {};

    constructor () {
        window.api?.receive('downloadTaskMetaData', (message) => {
            console.log(message);
            this.callbacks[`meta-data-${message.callbackId}`].resolve(message.metaData);
            delete this.callbacks[`meta-data-${message.callbackId}`];
        });
        window.api?.receive('downloadTaskProgress', (message) => {
            console.log(message);
            this.onDataCallbacks[message.callbackId]?.(message.percentageComplete);
        });
        window.api?.receive('downloadTaskDownloaded', (message) => {
            console.log(message);
            this.callbacks[`downloaded-${message.callbackId}`].resolve();
            delete this.callbacks[`downloaded-${message.callbackId}`];
            delete this.onDataCallbacks[message.callbackId];
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
            metaData: new Promise<YtResponse>((resolve, reject) => {
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

    public getSetting(settingKey: string) {
        return new Promise<string>((resolve, reject) => {
            const callbackId = this.generateCallbackId();
            this.callbacks[callbackId] = { resolve, reject };
            window.api?.send('getSetting', { callbackId, settingKey })
        });
    }

    public setSetting(settingKey: string, value: any) {
        return new Promise<void>((resolve, reject) => {
            const callbackId = this.generateCallbackId();
            this.callbacks[callbackId] = { resolve, reject };
            window.api?.send('setSetting', { callbackId, settingKey, value })
        });
    }

    private generateCallbackId() {
        return (Math.random() + 1).toString(36).substring(2);
    }
}


const electronJsApi = new ElectronJsApi();
export { electronJsApi };