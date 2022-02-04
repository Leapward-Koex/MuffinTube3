import { BrowserWindow, ipcRenderer } from "electron";
import { DownloadTaskHandler } from "./downloadTaskHandler";

export interface DownloadTaskStartType {
    videoUrl: string,
    callbackId: string
}

export interface DownloadTaskUpdateType {
    callbackId: string,
    currentStreamLength: number
}

export class ElectronNativeApi {

    constructor (
        private window: BrowserWindow
    ) {
        this.registerEventListeners();
    }

    private registerEventListeners() {
        ipcRenderer.on('startDownloadTask', (event, message: DownloadTaskStartType) => {
            this.addTask(message.videoUrl, message.callbackId)
        });
    }

    public addTask(videoUrl: string, callbackId) {
        //'https://www.youtube.com/watch?v=5TZ5twGgu9Y'
        const downloadHandler = new DownloadTaskHandler('https://www.youtube.com/watch?v=5TZ5twGgu9Y');
        downloadHandler.startTask((currentStreamLength) => {
            console.log('Recieved', currentStreamLength, 'bytes')
            this.window.webContents.send('downloadTaskProgress', { callbackId, currentStreamLength } as DownloadTaskUpdateType)
        });
    }
}