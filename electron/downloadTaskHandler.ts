import { create as createYtdl} from 'youtube-dl-exec'
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
    constructor (
        private videoUrl: string,
        private ffmpegConverter = new FfmpegConverter(),
        private tagger = new Id3MetaDataTagger()
    ) {

    }

    public async startTask(onData: (totalLength: number, resolvedLength: number) => void) {
        const downloadInformation = await this.downloadAudio(onData);
        const mp3Path = await this.ffmpegConverter.convertToMp3(downloadInformation.path, downloadInformation.title);
        await this.tagger.embedTags(mp3Path, downloadInformation)
        await this.moveToDownloadDirectory(mp3Path, downloadInformation.title)
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

    private downloadAudio(onData: (totalLength: number, resolvedLength: number) => void) {
        const ytdlPath = path.join(app.getAppPath(), 'electron', 'ytdl', 'youtube-dl.exe')
        const youtubedl = createYtdl(ytdlPath);
        return new Promise<VideoMetaData>((resolve, reject) => {
            youtubedl(this.videoUrl, {
                dumpSingleJson: true,
                noWarnings: true,
                noCheckCertificate: true,
                format: 'bestaudio',
                youtubeSkipDashManifest: true,
                referer: this.videoUrl
            }).then(output => {
                const { thumbnail, title, ext, filesize } = output;
                const fileName = `${title}.${ext}`;
                const destinationPath =  path.join(app.getAppPath(), 'temp', fileName)

                fs.open(destinationPath, "wx", function (openError, fd) {
                    if (openError) throw openError;
                    fs.close(fd, function (closeError) {
                        if (closeError) throw closeError;
                        fetch(output.url).then((response) => {
                            let resolvedLength = 0;
                            const fileStream = fs.createWriteStream(destinationPath);
                            response.body!.on('error', reject);
                            response.body!.on('data', (data: Buffer) => {
                                resolvedLength += data.length;
                                onData(filesize, resolvedLength);
                            });
                            fileStream.on('finish', () => {
                                console.log('done!');
                                resolve({
                                    path: destinationPath,
                                    thumbnail,
                                    title
                                });
                            });
                            response.body!.pipe(fileStream);
                        });
                    });
                });
            })
        });
    }
}