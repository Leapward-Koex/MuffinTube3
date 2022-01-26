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
        const interval = setInterval(() => {
            setDownloadPercent((downloadPercent) => {
                if (downloadPercent >= 99) {
                    clearInterval(interval);
                }

                return downloadPercent + 1
            });

        }, 32);

        return () => clearInterval(interval);
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