import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { AnimatedClippedImage } from './animatedClippedImage';
import ProgressBar from 'react-bootstrap/ProgressBar'

type DownloadTaskProps = {
    thumbnailUrl: string;
    percentageCompleted: number; // 0 - 1
    status: string;
}

export const DownloadTask = ({ thumbnailUrl, percentageCompleted, status }: DownloadTaskProps) => {
    // const [downloadPercent, setDownloadPercent] = useState(0);

    // useEffect(() => {
    //     let interval: NodeJS.Timer;
    //     const timeout = setTimeout(() => {
    //         interval = setInterval(() => {
    //             setDownloadPercent((downloadPercent) => {
    //                 if (downloadPercent >= 99) {
    //                     clearInterval(interval);
    //                 }
    
    //                 return downloadPercent + 5
    //             });
    
    //         }, 500);
    //     }, 500)


    //     return () => {
    //         clearTimeout(timeout);
    //         clearInterval(interval);
    //     }
    // }, []);

    return (
    <div style={{borderRadius: '10px', overflow: 'hidden', border: '2px solid white', boxShadow: '0px 2px 12px 2px rgba(0,0,0,0.83)'}}>
        <div className="image-container">
            <AnimatedClippedImage imageUrl={thumbnailUrl} percentage={percentageCompleted * 100} />
        </div>
        <ProgressBar striped animated style={{marginTop: 0, borderRadius: 0}} variant={percentageCompleted >= 1 ? 'success' : 'info'} now={percentageCompleted * 100} />
    </div>);
}