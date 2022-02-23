import { VoidCallbackPayload, DownloadTaskStartType, DownloadTaskUpdateType, GetSettingValuePayload, SetSettingPayload, GetSettingPayload } from '../../electron/electronNativeApi'

interface JsExposedApi {
    send(channel: 'startDownloadTask', params: DownloadTaskStartType): void;
    send(channel: 'getSetting', params: GetSettingPayload): void;
    send(channel: 'setSetting', params: SetSettingPayload): void;
    receive(channel: 'downloadTaskProgress', callback: (data: DownloadTaskUpdateType) => void): void;
    receive(channel: 'voidCallback', callback: (data: VoidCallbackPayload) => void): void;
    receive(channel: 'getSetting', callback: (data: GetSettingValuePayload) => void): void;
} 

declare global {
    interface Window { 
        api?: JsExposedApi;
    }
}

class ElectronJsApi {
    private callbacks: {[callbackId: string]: { resolve: Function, reject: Function }} = {};

    constructor () {
        window.api?.receive('downloadTaskProgress', (message) => {
            console.log(message)
        });

        window.api?.receive('voidCallback', (message) => {
            console.log(message);
            this.callbacks[message.callbackId]?.resolve();
        });

        window.api?.receive('getSetting', (message) => {
            console.log(message);
            this.callbacks[message.callbackId]?.resolve(message.value);
        });
    }

    public startDownload(videoUrl: string) {
        window.api?.send('startDownloadTask', { videoUrl, callbackId: this.generateCallbackId() })
    }

    public getSetting(settingKey: string) {
        return new Promise<string>((resolve, reject) => {
            const callbackId = this.generateCallbackId();
            this.callbacks[callbackId] = { resolve, reject };
            window.api?.send('getSetting', { callbackId: this.generateCallbackId(), settingKey })
        });
    }

    private generateCallbackId() {
        return (Math.random() + 1).toString(36).substring(2);
    }
}


const electronJsApi = new ElectronJsApi();
export { electronJsApi };