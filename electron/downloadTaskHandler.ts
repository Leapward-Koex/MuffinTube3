import { create as createYtdl} from 'youtube-dl-exec'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import fetch from 'node-fetch'
import { FfmpegConverter } from './ffmpegConverter';
import { Id3MetaDataTagger } from './id3MetaDataTagger';

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
        // Convert to mp3 (130Kb/s OPUS -> 256kb/s MP3)
        const mp3Path = await this.ffmpegConverter.convertToMp3(downloadInformation.path, downloadInformation.title);
        await this.tagger.embedTags(mp3Path, downloadInformation)
        // Embed metadata
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