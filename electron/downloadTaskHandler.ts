import ytdl from "ytdl-core";
import { create as createYtdl} from 'youtube-dl-exec'

export class DownloadTaskHandler {
    constructor (
        private videoUrl: string
    ) {

    }

    public startTask (onData: (totalLength: number, resolvedLength: number) => void) {
        const youtubedl = createYtdl();
        return new Promise<void>((resolve, reject) => {
            youtubedl(this.videoUrl, {
                dumpSingleJson: true,
                noWarnings: true,
                noCheckCertificate: true,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true,
                referer: this.videoUrl
            }).then(output => {
                console.log(output)
            })
        });
    }
}