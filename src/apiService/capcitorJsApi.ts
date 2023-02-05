import { settingsKey } from "../sharedEnums";
import { IJsApi, YoutubeVideoMetaData } from "./IJsApi";
import { Preferences } from '@capacitor/preferences';
import { CapacitorJsApi as NativeApi } from 'muffintube-api'
import { Plugin } from "@capacitor/core";
import { DownloadTaskMetaDataPayload, DownloadTaskUpdateType, ValuePayload, VoidCallbackPayload } from "../../electron/electronNativeApi";
import { BrowserId3TaggerManager } from "../managers/browserId3TaggerManager";

class CapacitorJsApi implements IJsApi {

	private callbacks: {[callbackId: string]: { resolve: Function, reject: Function }} = {};
    private onDataCallbacks: {[callbackId: string]: (percentageComplete: number) => void} = {};

    constructor () {
		(NativeApi as unknown as Plugin).addListener(
			'downloadTaskProgress',
			(message: DownloadTaskUpdateType) => {
				console.log(message);
				this.onDataCallbacks[message.callbackId]?.(message.percentageComplete);
				if (message.percentageComplete === 1 && this.onDataCallbacks[message.callbackId]) {
					delete this.onDataCallbacks[message.callbackId];
				}
			},
		);

		(NativeApi as unknown as Plugin).addListener(
			'downloadTaskMetaData',
			(message: DownloadTaskMetaDataPayload) => {
				console.log(message);
				this.callbacks[`meta-data-${message.callbackId}`].resolve(message.metaData);
				delete this.callbacks[`meta-data-${message.callbackId}`];
			},
		);

		(NativeApi as unknown as Plugin).addListener(
			'downloadTaskDownloaded',
			async (message: {callbackId: string, outputFile: string, metaData: YoutubeVideoMetaData }) => {
				console.log(message);
				this.callbacks[`downloaded-${message.callbackId}`].resolve();
				delete this.callbacks[`downloaded-${message.callbackId}`];
				const browserTagger = new BrowserId3TaggerManager();
				await browserTagger.embedTags(message.outputFile, message.metaData.title, "", message.metaData.imageUrl);
				this.callbacks[message.callbackId].resolve(message.outputFile);
				delete this.callbacks[message.callbackId];
			},
		);

		(NativeApi as unknown as Plugin).addListener(
			'downloadTaskFinished',
			(message: ValuePayload) => {
            console.log(message);
            this.callbacks[message.callbackId].resolve(message.value);
            delete this.callbacks[message.callbackId];
			},
		);
    }

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
		onCheckingForUpdates();
		NativeApi.initializeYoutubeDl().then((success) => {
			onYtdlVersionCheckComplete(0);
			if (success) {
				onComplete();
			}
		}) 
	};
	
	public removeYtdlDependencyListeners(){

	}

    public startDownloadTask(
        videoUrl: string
    ) {
        const callbackId = this.generateCallbackId();

        const promiseEvents = {
            taskFinished: new Promise<string>((resolve, reject) => {
				this.callbacks[callbackId] = { resolve, reject };
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
		this.getSetting(settingsKey.downloadPath).then((saveLocation) => {
			if (saveLocation) {
				NativeApi.startYoutubeDownload({videoUrl, callbackId, saveLocation})
			}
			else {
				//ERROR!
			}
		})
		return promiseEvents;
    }
	
	public openFileInExplorer(mp3Path: string) {

	}

	public abortDownload(callbackId: string) {

	}

	public setSongTags(callbackId: string, mp3Path: string, songTitle: string, artistName: string) {
		const browserTagger = new BrowserId3TaggerManager();
		browserTagger.embedTags(mp3Path, songTitle, artistName)
	}

	public async getSetting(settingKey: settingsKey) {
		return JSON.parse((await Preferences.get({ key: settingKey })).value ?? '""')
	}

	public async setSetting(settingKey: settingsKey, value: any) {
		await Preferences.set({
			key: settingKey,
			value: JSON.stringify(value)
		})
	}

	public async openFolderPicker() {
		return (await NativeApi.openFolderPicker()).value;
	};

	public getPlatForm(): 'capacitor' | 'electron' {
		return 'capacitor';
	}

}

const capacitorJsApi = new CapacitorJsApi();
export { capacitorJsApi };