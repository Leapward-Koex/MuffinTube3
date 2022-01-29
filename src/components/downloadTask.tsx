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
    
                    return downloadPercent + 5
                });
    
            }, 500);
        }, 500)


        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        }
    }, []);

    return (
    <>
        <div className="image-container">
            <AnimatedClippedImage imageUrl={`https://images7.alphacoders.com/341/thumb-1920-341882.jpg`} percentage={downloadPercent} />
            {downloadPercent}
        </div>
        <div className="progress-bar">

        </div>
    </>);
}