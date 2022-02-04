import ytdl from "ytdl-core";

export class DownloadTaskHandler {
    constructor (
        private videoUrl: string
    ) {

    }

    public startTask (onData: (chunksLength: number) => void) {
        return new Promise<void>((resolve, reject) => {
            const thumbnailUrl = `https://img.youtube.com/vi/l4WjAiBFYjw/maxresdefault.jpg`;
            // let info = await ytdl.getInfo('5TZ5twGgu9Y');
            // let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            debugger
            const stream = ytdl(this.videoUrl);
    
            stream.on('data', chunk => {
                console.log('downloaded', chunk.length);
                onData(chunk.length);
            });
    
            stream.on('error', err => {
                console.error(err);
                reject();
            });
    
            stream.on('end', () => {
                console.log('Finished');
                resolve()
            });
        });
    }
}