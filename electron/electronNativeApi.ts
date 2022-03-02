import { BrowserWindow, ipcMain } from "electron";
import { DownloadTaskHandler } from "./downloadTaskHandler";
import throttle from 'lodash.throttle';
import storage from 'electron-json-storage'
import { YtResponse } from "youtube-dl-exec";

export interface DownloadTaskStartType {
    videoUrl: string;
    callbackId: string;
}

export interface DownloadTaskUpdateType {
    callbackId: string;
    percentageComplete: number;
}

export interface GetSettingPayload {
    callbackId: string;
    settingKey: string;
}

export interface GetSettingValuePayload {
    callbackId: string;
    value: any;
}

export type SetSettingPayload = GetSettingPayload & GetSettingValuePayload;

export interface VoidCallbackPayload {
    callbackId: string
}

export interface DownloadTaskMetaDataPayload {
    callbackId: string;
    metaData: YtResponse;
}

export class ElectronNativeApi {

    constructor (
        private window: BrowserWindow
    ) {
        this.registerEventListeners();
    }

    private registerEventListeners() {
        ipcMain.on('startDownloadTask', (event, message: DownloadTaskStartType) => {
            this.addTask(message.videoUrl, message.callbackId)
        });
        ipcMain.on('getSetting', (event, message: GetSettingPayload) => {
            storage.get(message.settingKey, (error, data) => {
                if (error) {
                    throw new Error(error)
                }
                const getSettingValuePayload: GetSettingValuePayload = { ...message, value: (data as any).value };
                this.window.webContents.send('getSetting', getSettingValuePayload)
            });
        });
        ipcMain.on('setSetting', (event, message: SetSettingPayload) => {
            storage.set(message.settingKey, { value: message.value }, (error) => {
                if (error) {
                    throw new Error(error);
                }
                const setSettingPayload: VoidCallbackPayload = { callbackId: message.callbackId };
                this.window.webContents.send('voidCallback', setSettingPayload)
            });
        });
    }

    public addTask(videoUrl: string, callbackId: string) {
        //'https://www.youtube.com/watch?v=5TZ5twGgu9Y'
        const downloadHandler = new DownloadTaskHandler(videoUrl);
        const throttledHandler = throttle<(totalLength: number, resolvedLength: number) => void>((totalLength: number, resolvedLength: number) => {
            console.log('Recieved', resolvedLength, 'bytes of', totalLength, 'bytes');
            const downloadTaskUpdate: DownloadTaskUpdateType = { callbackId, percentageComplete: resolvedLength / totalLength }
            this.window.webContents.send('downloadTaskProgress', downloadTaskUpdate)
        }, 100, { leading: true, trailing: true });
        downloadHandler.startTask((metaData) => {
            const downloadTaskMetaDataMessage: DownloadTaskMetaDataPayload = { callbackId, metaData };
            this.window.webContents.send('downloadTaskMetaData', downloadTaskMetaDataMessage)
        },
        throttledHandler,
        () => {
            this.window.webContents.send('downloadTaskDownloaded', { callbackId })
        }).then(() => {
            const downloadTaskFinishedMessage: VoidCallbackPayload = { callbackId };
            this.window.webContents.send('downloadTaskFinished', downloadTaskFinishedMessage)
        });
    }
}