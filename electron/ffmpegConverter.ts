import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import fetch from 'node-fetch'
import { ChildProcess, execFile } from 'child_process'

export class FfmpegConverter {
    private convertJob: ChildProcess | undefined;

    public convertToMp3(opusPath: string, title: string) {
        return new Promise<string>((resolve) => {
            const outputFileName = `${title}.mp3`;
            this.convertJob = execFile( path.join(app.getAppPath(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'), [
                '-i',
                opusPath,
                '-acodec',
                'libmp3lame',
                '-q:a',
                '0',
                "C:\\Dev\\MuffinTube3\\temp\\" + outputFileName
            ], (error, stdout, stderr) => {
                if (error) throw error;
                resolve(outputFileName); // todo resolve correct path too
                console.log(stdout);
            });
        })

    }

    public abortJob() {
        if (this.convertJob && !this.convertJob.killed) {
            this.convertJob.kill();
        }
    }
}