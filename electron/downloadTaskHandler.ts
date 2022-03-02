import { create as createYtdl, YtResponse} from 'youtube-dl-exec'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import fetch from 'node-fetch'
import mv from 'mv'
import { FfmpegConverter } from './ffmpegConverter';
import { Id3MetaDataTagger } from './id3MetaDataTagger';
import storage from 'electron-json-storage'
import { deleteFile, ensureEmptyFileExists } from './fileUtilities'

export interface VideoMetaData {
    path: string,
    thumbnail: string,
    title: string
}

export class DownloadTaskHandler {
    private ytdlPath = path.join(app.getAppPath(), 'electron', 'ytdl', 'youtube-dl.exe');
    private abortController = new AbortController()
    private mp3Path: string | undefined
    private audioPath: string | undefined
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
        await this.moveToDownloadDirectory(this.mp3Path, metaData.title);
        await deleteFile(this.audioPath);
        await deleteFile(this.mp3Path);
    }

    public async abort() {
        this.abortController.abort();
        this.ffmpegConverter.abortJob();
        if (this.audioPath) {
            await deleteFile(this.audioPath)
        }
        if (this.mp3Path) {
            await deleteFile(this.mp3Path)
        }
    }

    private moveToDownloadDirectory(mp3Path: string, audioTitle: string) {
        return new Promise<void>((resolve) => {
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
                    resolve();
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
            const destinationPath =  path.join(app.getAppPath(), 'temp', fileName)

            await ensureEmptyFileExists(destinationPath);
            fetch(downloadUrl, { signal: this.abortController.signal }).then((response) => {
                let resolvedLength = 0;
                const fileStream = fs.createWriteStream(destinationPath);
                response.body!.on('error', reject);
                response.body!.on('data', (data: Buffer) => {
                    resolvedLength += data.length;
                    onData(fileSize, resolvedLength);
                });
                fileStream.on('finish', () => {
                    console.log('done!');
                    resolve(destinationPath);
                });
                response.body!.pipe(fileStream);
            });
        });
    }
}
