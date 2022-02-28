import { create as createYtdl, YtResponse} from 'youtube-dl-exec'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import fetch from 'node-fetch'
import mv from 'mv'
import { FfmpegConverter } from './ffmpegConverter';
import { Id3MetaDataTagger } from './id3MetaDataTagger';
import storage from 'electron-json-storage'

export interface VideoMetaData {
    path: string,
    thumbnail: string,
    title: string
}

export class DownloadTaskHandler {
    private ytdlPath = path.join(app.getAppPath(), 'electron', 'ytdl', 'youtube-dl.exe');
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
        const opusPath = await this.downloadAudio(
            metaData.filesize,
            metaData.url,
            metaData.title,
            metaData.ext,
            onData
        );
        onDownloadComplete();
        const mp3Path = await this.ffmpegConverter.convertToMp3(opusPath, metaData.title);
        await this.tagger.embedTags(mp3Path, metaData.thumbnail)
        await this.moveToDownloadDirectory(mp3Path, metaData.title)
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
        return new Promise<string>((resolve, reject) => {
            const fileName = `${videoTitle}.${formatExtension}`;
            const destinationPath =  path.join(app.getAppPath(), 'temp', fileName)

            fs.open(destinationPath, "wx", function (openError, fd) {
                if (openError) throw openError;
                fs.close(fd, function (closeError) {
                    if (closeError) throw closeError;
                    fetch(downloadUrl).then((response) => {
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
            });
        });
    }
}