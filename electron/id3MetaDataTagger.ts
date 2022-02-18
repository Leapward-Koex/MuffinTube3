import fs from 'fs'
import fetch from 'node-fetch'
import ID3Writer from 'browser-id3-writer';

export class Id3MetaDataTagger {
    constructor(
        private mp3Path: string,
        private thumbnailUrl: string
    ) {

    }
    
    public async embedTags() {
        const mp3Buffer = await this.readMp3File();
        const thumbnailBuffer = await this.downloadThumbnail();
        const writer = new ID3Writer(mp3Buffer) as any; // https://www.npmjs.com/package/browser-id3-writer
        writer.setFrame('TIT2', 'Home')
            .setFrame('TPE1', ['My Artist'])
            .setFrame('APIC', {
                type: 3, // Front cover
                data: thumbnailBuffer,
                description: ''
            });
        writer.addTag();
        
        this.writeMp3File(Buffer.from(writer.arrayBuffer))
    }

    private async downloadThumbnail() {
        const res = await fetch(this.thumbnailUrl)
        return await res.arrayBuffer()
    }

    private readMp3File() {
        return new Promise((resolve) => {
            fs.readFile(this.mp3Path, null , (err, data) => {
                if (err) throw err
                resolve(data);
            });
        });
    }

    private writeMp3File(buffer: Buffer) {
        return new Promise<void>((resolve) => {
            fs.writeFile(this.mp3Path + "tagged.mp3", buffer, undefined, (err) => {
                if (err) throw err
                resolve();
            });
        });
    }
}
