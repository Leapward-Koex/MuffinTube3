import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import fetch from 'node-fetch'
import { ChildProcess, execFile } from 'child_process'

export class FfmpegConverter {
    private convertJob: ChildProcess | undefined;

    public convertToMp3(audioPath: string, title: string) {
        return new Promise<string>((resolve) => {
            const outputFileName = `${title}.mp3`;
            const destinationPath = path.join(app.getPath('userData'), 'temp', outputFileName);
            this.convertJob = execFile( path.join(app.getAppPath(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'), [
                '-i',
                audioPath,
                '-acodec',
                'libmp3lame',
                '-q:a',
                '0',
                destinationPath
            ], (error, stdout, stderr) => {
                if (error) throw error;
                resolve(destinationPath);
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