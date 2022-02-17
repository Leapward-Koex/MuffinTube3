import { BrowserWindow, ipcMain } from "electron";
import { DownloadTaskHandler } from "./downloadTaskHandler";
import throttle from 'lodash.throttle';

export interface DownloadTaskStartType {
    videoUrl: string,
    callbackId: string
}

export interface DownloadTaskUpdateType {
    callbackId: string,
    percentageComplete: number
}

export interface DownloadTaskFinished {
    callbackId: string
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
    }

    public addTask(videoUrl: string, callbackId: string) {
        //'https://www.youtube.com/watch?v=5TZ5twGgu9Y'
        // const downloadHandler = new DownloadTaskHandler('https://www.youtube.com/watch?v=5TZ5twGgu9Y');
        // const throttledHandler = throttle<(totalLength: number, resolvedLength: number) => void>((totalLength: number, resolvedLength: number) => {
        //     console.log('Recieved', resolvedLength, 'bytes of', totalLength, 'bytes');
        //     const downloadTaskUpdate: DownloadTaskUpdateType = { callbackId, percentageComplete: resolvedLength / totalLength }
        //     this.window.webContents.send('downloadTaskProgress', downloadTaskUpdate)
        // });
        // downloadHandler.startTask(throttledHandler).then(() => {
        //     const downloadTaskFinishedMessage: DownloadTaskFinished = { callbackId };
        //     this.window.webContents.send('downloadTaskFinished', downloadTaskFinishedMessage)
        // });
    }
}