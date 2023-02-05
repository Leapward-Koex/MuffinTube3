//@ts-ignore
import ID3Writer from 'browser-id3-writer';
import { CapacitorJsApi } from 'muffintube-api';
import {Buffer} from 'buffer';


export class BrowserId3TaggerManager {
    public async embedTags(mp3Path: string, songTitle: string, artistName: string, thumbnailUrl?: string) {
        const mp3Buffer = await this.readMp3File(mp3Path);
        const writer = new ID3Writer(mp3Buffer) as any; // https://www.npmjs.com/package/browser-id3-writer
        writer.setFrame('TIT2', songTitle)
            .setFrame('TPE1', [artistName])

		if (thumbnailUrl) {
			const thumbnailBuffer = await this.downloadThumbnail(thumbnailUrl);
			writer.setFrame('APIC', {
                type: 3, // Front cover
                data: thumbnailBuffer,
                description: ''
            });
		}
        writer.addTag();
        
        await this.writeMp3File(mp3Path, Buffer.from(writer.arrayBuffer))
    }

	private async downloadThumbnail(thumbnailUrl: string) {
        const res = await fetch(thumbnailUrl)
        return await res.arrayBuffer()
    }

	private async readMp3File(mp3Path: string) {
		const fileReadData = await CapacitorJsApi.readFileAsBase64({value: mp3Path});
		return this.base64ToArrayBuffer(fileReadData.value)
    }

	private writeMp3File(mp3Path: string, buffer: Buffer) {
		return CapacitorJsApi.writeFileFromBase64({ path: mp3Path, data: buffer.toString('base64') })
    }

	private base64ToArrayBuffer(base64: string) {
		var binary_string = window.atob(base64);
		var len = binary_string.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}
}