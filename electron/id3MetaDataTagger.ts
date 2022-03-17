import fs from 'fs'
import fetch from 'node-fetch'
import ID3Writer from 'browser-id3-writer';

export class Id3MetaDataTagger {    
    public async embedTags(mp3Path: string, songTitle: string, artistName: string, thumbnailUrl: string) {
        const mp3Buffer = await this.readMp3File(mp3Path);
        const thumbnailBuffer = await this.downloadThumbnail(thumbnailUrl);
        const writer = new ID3Writer(mp3Buffer) as any; // https://www.npmjs.com/package/browser-id3-writer
        writer.setFrame('TIT2', songTitle)
            .setFrame('TPE1', [artistName])
            .setFrame('APIC', {
                type: 3, // Front cover
                data: thumbnailBuffer,
                description: ''
            });
        writer.addTag();
        
        await this.writeMp3File(mp3Path, Buffer.from(writer.arrayBuffer))
    }

    private async downloadThumbnail(thumbnailUrl: string) {
        const res = await fetch(thumbnailUrl)
        return await res.arrayBuffer()
    }

    private readMp3File(mp3Path: string) {
        return new Promise((resolve) => {
            fs.readFile(mp3Path, null , (err, data) => {
                if (err) throw err
                resolve(data);
            });
        });
    }

    private writeMp3File(mp3Path: string, buffer: Buffer) {
        return new Promise<void>((resolve) => {
            fs.writeFile(mp3Path, buffer, (err) => {
                if (err) throw err
                resolve();
            });
        });
    }
}
