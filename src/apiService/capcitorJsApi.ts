import { YtResponse } from "youtube-dl-exec";
import { settingsKey } from "../sharedEnums";
import { IJsApi } from "./IJsApi";
import { Preferences } from '@capacitor/preferences';


class CapacitorJsApi implements IJsApi {

	private callbacks: {[callbackId: string]: { resolve: Function, reject: Function }} = {};
    private onDataCallbacks: {[callbackId: string]: (percentageComplete: number) => void} = {};

	private generateCallbackId() {
        return (Math.random() + 1).toString(36).substring(2);
    }

	public addYtdlDependencyListeners(
		onCheckingForUpdates: () => void,
		onYtdlVersionCheckComplete: (totalDownloadSize: number) => void,
		onYtdlData: (resolvedSize: number) => void,
		onYtdlpData: (resolvedSize: number) => void,
		onComplete: () => void
	) {

	};
	
	public removeYtdlDependencyListeners(){

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

	}

	public abortDownload(callbackId: string) {

	}

	public setSongTags(callbackId: string, songTitle: string, artistName: string) {

	}

	public async getSetting(settingKey: settingsKey) {
		return (await Preferences.get({ key: settingKey })).value ?? ''
	}

	public async setSetting(settingKey: settingsKey, value: any) {
		await Preferences.set({
			key: settingKey,
			value: JSON.stringify(value)
		})
	}

	public openFolderPicker() {
		return Promise.resolve('')
	};

}

const capacitorJsApi = new CapacitorJsApi();
export { capacitorJsApi };