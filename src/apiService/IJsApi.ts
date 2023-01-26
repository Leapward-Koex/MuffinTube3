import { YtResponse } from "youtube-dl-exec";
import { settingsKey } from "../sharedEnums";

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
		metaData: Promise<YtResponse>,
		downloaded: Promise<void>,
		onData: (onDataHandler: (percentageComplete: number) => void) => void;
		callbackId: string,
	}

    openFileInExplorer: (mp3Path: string) => void;

    abortDownload: (callbackId: string)  => void;

    setSongTags: (callbackId: string, songTitle: string, artistName: string) => void;

    getSetting: (settingKey: settingsKey) => Promise<string>;

    setSetting: (settingKey: settingsKey, value: any) => Promise<void>;

	openFolderPicker: () => Promise<string>;
}