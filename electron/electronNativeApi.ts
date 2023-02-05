import { BrowserWindow, ipcMain, shell, dialog } from "electron";
import { DownloadTaskHandler } from "./downloadTaskHandler";
import throttle from 'lodash.throttle';
import { doesFileExist } from "./fileUtilities";
import settingManager from './settingManager';
import { settingsKey } from "../src/sharedEnums";
import { YoutubeVideoMetaData } from "../src/apiService/IJsApi";

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
    settingKey: settingsKey;
}

export interface ValuePayload {
    callbackId: string;
    value: any;
}

export interface SetSongTagsPayload {
    callbackId: string;
    songTitle: string;
    artistName: string;
}

export type SetSettingPayload = GetSettingPayload & ValuePayload;

export interface VoidCallbackPayload {
    callbackId: string
}

export interface DownloadTaskMetaDataPayload {
    callbackId: string;
    metaData: YoutubeVideoMetaData;
}

export interface YtdlDownloadUpdatePayload { 
    variantName: string,
    fileSize: number,
    resolvedLength: number
}

export class ElectronNativeApi {

    private downloadTasks: {[callbackId: string]: DownloadTaskHandler} = {};

    constructor (
        private window: BrowserWindow
    ) {
        this.registerEventListeners();
    }

    private registerEventListeners() {
        ipcMain.on('startDownloadTask', (event, message: DownloadTaskStartType) => {
            this.addTask(message.videoUrl, message.callbackId)
        });
        ipcMain.on('abortDownload', (event, message: VoidCallbackPayload) => {
            this.downloadTasks[message.callbackId]?.abort();
        });
        ipcMain.on('showFileInExplorer', async (event, message: ValuePayload) => {
            const fileExists = await doesFileExist(message.value);
            if (fileExists) {
                shell.showItemInFolder(message.value);
            }
        });
        ipcMain.on('getSetting', async (event, message: GetSettingPayload) => {
            const value = await settingManager.getSettings(message.settingKey);
            const getSettingValuePayload: ValuePayload = { ...message, value };
            this.window.webContents.send('getSetting', getSettingValuePayload)
        });
        ipcMain.on('setSetting', async (event, message: SetSettingPayload) => {
            await settingManager.setSetting(message.settingKey, message.value);
            const setSettingPayload: VoidCallbackPayload = { callbackId: message.callbackId };
            this.window.webContents.send('voidCallback', setSettingPayload)
        });
        ipcMain.on('openFolderPicker', (event, message: VoidCallbackPayload) => {
            dialog.showOpenDialog(this.window, {
                properties: ['openDirectory']
            }).then((value) => {
                const pathPayload: ValuePayload = { ...message, value: value.filePaths.length === 1 ? value.filePaths[0] : undefined };
                this.window.webContents.send('openFolderPicker', pathPayload)
            });
        });
        ipcMain.on('setSongTags', (event, message: SetSongTagsPayload) => {
            this.downloadTasks[message.callbackId]?.setTags(message.songTitle, message.artistName)
        });
    }

    public addTask(videoUrl: string, callbackId: string) {
        //'https://www.youtube.com/watch?v=5TZ5twGgu9Y'
        const downloadHandler = new DownloadTaskHandler(videoUrl);
        this.downloadTasks[callbackId] = downloadHandler;
        const throttledHandler = throttle<(totalLength: number, resolvedLength: number) => void>((totalLength: number, resolvedLength: number) => {
            console.log('Recieved', resolvedLength, 'bytes of', totalLength, 'bytes');
            const downloadTaskUpdate: DownloadTaskUpdateType = { callbackId, percentageComplete: resolvedLength / totalLength }
            this.window.webContents.send('downloadTaskProgress', downloadTaskUpdate)
        }, 1000, { leading: true, trailing: true });

        downloadHandler.startTask((metaData) => {
            const downloadTaskMetaDataMessage: DownloadTaskMetaDataPayload = { callbackId, metaData };
            this.window.webContents.send('downloadTaskMetaData', downloadTaskMetaDataMessage)
        },
        throttledHandler,
        () => {
            this.window.webContents.send('downloadTaskDownloaded', { callbackId })
        }).then((downloadMp3Path) => {
            const downloadTaskFinishedMessage: ValuePayload = { callbackId, value: downloadMp3Path };
            this.window.webContents.send('downloadTaskFinished', downloadTaskFinishedMessage)
        });
    }
}