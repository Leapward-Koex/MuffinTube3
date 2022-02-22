import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { AnimatedClippedImage } from './animatedClippedImage';
import ProgressBar from 'react-bootstrap/ProgressBar'

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
    <div style={{borderRadius: '10px', overflow: 'hidden', border: '2px solid white', boxShadow: '0px 2px 12px 2px rgba(0,0,0,0.83)'}}>
        <div className="image-container">
            <AnimatedClippedImage imageUrl={`https://images7.alphacoders.com/341/thumb-1920-341882.jpg`} percentage={downloadPercent} />
        </div>
        <ProgressBar striped animated style={{marginTop: 0, borderRadius: 0}} variant={downloadPercent >= 100 ? 'success' : 'info'} now={downloadPercent} />
    </div>);
}