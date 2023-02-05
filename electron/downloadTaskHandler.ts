import { create as createYtdl } from 'youtube-dl-exec'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import fetch, { AbortError } from 'node-fetch'
import mv from 'mv'
import { FfmpegConverter } from './ffmpegConverter';
import { Id3MetaDataTagger } from './id3MetaDataTagger';
import storage from 'electron-json-storage'
import { deleteFile, ensureDirectoryExists, ensureEmptyFileExists } from './fileUtilities'
import settingManager from './settingManager'
import { settingsKey } from '../src/sharedEnums'
import log from 'electron-log'
import { YoutubeVideoMetaData } from '../src/apiService/IJsApi'

export interface VideoMetaData {
    path: string,
    thumbnail: string,
    title: string
}

export class DownloadTaskHandler {
    private abortController = new AbortController();
    private mp3Path: string | undefined;
    private audioPath: string | undefined;
    private aborted = false;
    private songTitle: string | undefined;
    private artistName: string | undefined;
    private taskCompleted: boolean | undefined
    private thumbnailUrl: string | undefined
    private desinationFilePath: string | undefined
    
    constructor (
        private videoUrl: string,
        private ffmpegConverter = new FfmpegConverter(),
        private tagger = new Id3MetaDataTagger()
    ) {

    }

    public async startTask(
        onMetaData: (metaData: YoutubeVideoMetaData) => void,
        onData: (totalLength: number, resolvedLength: number) => void,
        onDownloadComplete: () => void
    ) {
        const metaData = await this.getMetaData();
        onMetaData(metaData);
        metaData.title = this.escapeSpecialCharacters(metaData.title);
        if (!this.songTitle) {
            this.songTitle = metaData.title;
        }
        this.thumbnailUrl = metaData.imageUrl;
        this.audioPath = await this.downloadAudio(
            metaData.fileSize,
            metaData.downloadUrl,
            metaData.title,
            metaData.extension,
            onData
        );
        onDownloadComplete();
        this.mp3Path = await this.ffmpegConverter.convertToMp3(this.audioPath, metaData.title);
        await this.tagger.embedTags(this.mp3Path, this.songTitle, this.artistName || '', this.thumbnailUrl);
        this.desinationFilePath = await this.moveToDownloadDirectory(this.mp3Path, metaData.title);
        await deleteFile(this.audioPath);
        await deleteFile(this.mp3Path);
        this.taskCompleted = true;
        return this.desinationFilePath;
    }

    public async abort() {
        this.aborted = true;
        this.abortController.abort();
        this.ffmpegConverter.abortJob();
        if (this.audioPath) {
            await deleteFile(this.audioPath)
        }
        if (this.mp3Path) {
            await deleteFile(this.mp3Path)
        }
    }

    public async setTags(songTitle: string, artistName: string) {
        this.songTitle = songTitle;
        this.artistName = artistName;
        if (this.taskCompleted) {
            await this.tagger.embedTags(this.desinationFilePath!, this.songTitle, this.artistName, this.thumbnailUrl!);
        }
    }

    private escapeSpecialCharacters(title: string) {
        return title.replaceAll(/[<>:"\/\\|?*]+/g, '')
    }

    private moveToDownloadDirectory(mp3Path: string, audioTitle: string) {
        return new Promise<string>((resolve) => {
            storage.get('downloadPath', (storageError, data) => {
                if (storageError) {
                    throw new Error(storageError)
                }
                if (!(data as any).value) {
                    throw new Error('Download destination not set!');
                }
                const destinationPath = path.join((data as any).value, `${audioTitle}.mp3`);
                mv(mp3Path, destinationPath, { mkdirp: true, clobber: true }, (error) => {
                    if (error) {
                        throw new Error(error);
                    }
                    resolve(destinationPath);
                })
            });
        }) 
    }

    private async getMetaData() {
        const ytdlVariantToUse = await settingManager.getSettings<'ytdl' | 'ytdlp'>(settingsKey.ytdlVariant);
        const ytdlVariantBinary = ytdlVariantToUse === 'ytdl' ? 'youtube-dl.exe' : 'yt-dlp.exe';
        const ytdlPath = path.join(app.getPath('userData'), 'binaries', 'ytdl', ytdlVariantBinary);
        log.info(`Acquiring meta data with ${ytdlPath}`)
        const youtubedl = createYtdl(ytdlPath);
        const youtubeResponse = await youtubedl(this.videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            format: 'bestaudio',
            noPlaylist: true,
            youtubeSkipDashManifest: true,
            referer: this.videoUrl
        });
		return {
			imageUrl: youtubeResponse.thumbnail,
			title: youtubeResponse.fulltitle,
			fileSize: youtubeResponse.filesize,
			extension: youtubeResponse.ext,
			downloadUrl: youtubeResponse.url
		}
    }

    private downloadAudio(fileSize: number, downloadUrl: string, videoTitle: string, formatExtension: string, onData: (totalLength: number, resolvedLength: number) => void) {
        return new Promise<string>(async (resolve, reject) => {
            const fileName = `${videoTitle}.${formatExtension}`;
            await ensureDirectoryExists(path.join(app.getPath('userData'), 'temp'));
            const destinationPath =  path.join(app.getPath('userData'), 'temp', fileName)

            await ensureEmptyFileExists(destinationPath);
            const fileStream = fs.createWriteStream(destinationPath);
            const handleError = (error: any) => {
                if (error instanceof AbortError) {
                    fileStream.close(async () => {
                        await deleteFile(destinationPath);
                        reject();
                    });
                }
            }
            const response = await fetch(downloadUrl, { signal: this.abortController.signal });
            let resolvedLength = 0;
            response.body!.on('error', (error) => handleError(error));
            response.body!.on('data', (data: Buffer) => {
                resolvedLength += data.length;
                onData(fileSize, resolvedLength);
            });
            fileStream.on('finish', () => {
                console.log('done!');
                fileStream.close(() => {
                    if (!this.aborted) {
                        resolve(destinationPath);
                    }
                });
            });
            response.body!.pipe(fileStream);
        });
    }
}
