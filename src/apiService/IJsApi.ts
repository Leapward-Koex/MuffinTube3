import { settingsKey } from "../sharedEnums";

export interface YoutubeVideoMetaData {
	title: string,
	imageUrl: string,
	fileSize: number,
	downloadUrl: string
}

export interface IJsApi {
	 addYtdlDependencyListeners: (
        onCheckingForUpdates: () => void,
        onYtdlVersionCheckComplete: (totalDownloadSize: number) => void,
        onYtdlData: (resolvedSize: number) => void,
        onYtdlpData: (resolvedSize: number) => void,
        onComplete: () => void
    ) => void;

    removeYtdlDependencyListeners: () => void;

    startDownloadTask:(
        videoUrl: string
    ) => {
		taskFinished: Promise<string>,
		metaData: Promise<YoutubeVideoMetaData>,
		downloaded: Promise<void>,
		onData: (onDataHandler: (percentageComplete: number) => void) => void;
		callbackId: string,
	}

    openFileInExplorer: (mp3Path: string) => void;

    abortDownload: (callbackId: string)  => void;

    setSongTags: (callbackId: string, mp3Path: string, songTitle: string, artistName: string, thumbnailUrl: string) => void;

    getSetting: (settingKey: settingsKey) => Promise<string>;

    setSetting: (settingKey: settingsKey, value: any) => Promise<void>;

	openFolderPicker: () => Promise<string>;

	getPlatForm: () => 'capacitor' | 'electron'
}