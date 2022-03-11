import { create as createYtdl, YtResponse} from 'youtube-dl-exec'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import fetch, { AbortError } from 'node-fetch'
import mv from 'mv'
import { FfmpegConverter } from './ffmpegConverter';
import { Id3MetaDataTagger } from './id3MetaDataTagger';
import storage from 'electron-json-storage'
import { deleteFile, ensureDirectoryExists, ensureEmptyFileExists } from './fileUtilities'

export interface VideoMetaData {
    path: string,
    thumbnail: string,
    title: string
}

export class DownloadTaskHandler {
    private ytdlPath = path.join(app.getPath('userData'), 'binaries', 'ytdl', 'yt-dlp.exe');
    private abortController = new AbortController();
    private mp3Path: string | undefined;
    private audioPath: string | undefined;
    private aborted = false;
    constructor (
        private videoUrl: string,
        private ffmpegConverter = new FfmpegConverter(),
        private tagger = new Id3MetaDataTagger()
    ) {

    }

    public async startTask(
        onMetaData: (metaData: YtResponse) => void,
        onData: (totalLength: number, resolvedLength: number) => void,
        onDownloadComplete: () => void
    ) {
        const metaData = await this.getMetaData();
        onMetaData(metaData);
        metaData.title = this.escapeSpecialCharacters(metaData.title)
        this.audioPath = await this.downloadAudio(
            metaData.filesize,
            metaData.url,
            metaData.title,
            metaData.ext,
            onData
        );
        onDownloadComplete();
        this.mp3Path = await this.ffmpegConverter.convertToMp3(this.audioPath, metaData.title);
        await this.tagger.embedTags(this.mp3Path, metaData.thumbnail);
        const desinationFilePath = await this.moveToDownloadDirectory(this.mp3Path, metaData.title);
        await deleteFile(this.audioPath);
        await deleteFile(this.mp3Path);
        return desinationFilePath;
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

    private getMetaData() {
        const youtubedl = createYtdl(this.ytdlPath);
        return youtubedl(this.videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificate: true,
            format: 'bestaudio',
            youtubeSkipDashManifest: true,
            referer: this.videoUrl
        });
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
