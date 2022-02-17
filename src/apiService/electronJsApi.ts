import { DownloadTaskFinished, DownloadTaskStartType, DownloadTaskUpdateType } from '../../electron/electronNativeApi'

interface JsExposedApi {
    send(channel: string, data: any): void;
    receive(channel: 'downloadTaskProgress', callback: (data: DownloadTaskUpdateType) => void): void;
    receive(channel: 'downloadTaskFinished', callback: (data: DownloadTaskFinished) => void): string;
} 

declare global {
    interface Window { 
        api?: JsExposedApi;
    }
}

class ElectronJsApi {
    private callbacks = {};

    constructor () {
        window.api?.receive('downloadTaskProgress', (message) => {
            console.log(message)
        });

        window.api?.receive('downloadTaskFinished', (message) => {
            console.log(message)
        });
    }

    public startDownload(videoUrl: string) {
        const params: DownloadTaskStartType = { videoUrl, callbackId: this.generateCallbackId() };
        window.api?.send('startDownloadTask', params)
    }

    private generateCallbackId() {
        return (Math.random() + 1).toString(36).substring(2);
    }
}


const electronJsApi = new ElectronJsApi();
export { electronJsApi };