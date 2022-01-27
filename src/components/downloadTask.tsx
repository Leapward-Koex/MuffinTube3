import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { AnimatedClippedImage } from './animatedClippedImage';

type DownloadTaskProps = {
    videoId: string;
    onCompleted: (videoId: string) => void;
}

export const DownloadTask = ({ videoId, onCompleted }: DownloadTaskProps) => {
    const [downloadPercent, setDownloadPercent] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timer;
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                setDownloadPercent((downloadPercent) => {
                    if (downloadPercent >= 99) {
                        clearInterval(interval);
                    }
    
                    return downloadPercent + 10
                });
    
            }, 1000);
        }, 1000)


        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        }
    }, []);

    return (
    <>
        <div className="image-container">
            <AnimatedClippedImage imageUrl={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} percentage={downloadPercent} />
            {downloadPercent}
        </div>
        <div className="progress-bar">

        </div>
    </>);
}