import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { AnimatedClippedImage } from './animatedClippedImage';
import { VideoTaskMenu } from './videoTaskMenu'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import FolderOpen from '@mui/icons-material/FolderOpen';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import LinearProgress from '@mui/material/LinearProgress';

export enum DownloadStatus {
    AcquiringMetaData,
    DownloadingAudio,
    ConvertingAudio,
    Finished,
    Aborted
}

type DownloadTaskProps = {
    thumbnailUrl: string;
    percentageCompleted: number; // 0 - 1
    status: DownloadStatus;
    abortDownload: () => void;
    openFolder: () => void;
}

export const DownloadTask = ({ thumbnailUrl, percentageCompleted, status, abortDownload, openFolder }: DownloadTaskProps) => {
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

    const getStatusText = (currentStatus: DownloadStatus, percent: number) => {
        switch (currentStatus) {
            case DownloadStatus.AcquiringMetaData: {
                return 'Loading video information...';
            }
            case DownloadStatus.DownloadingAudio: {
                return `Downloading audio ${percent}%...`;
            }
            case DownloadStatus.ConvertingAudio: {
                return 'Converting...';
            }
            case DownloadStatus.Finished: {
                return 'Completed';
            }
            case DownloadStatus.Aborted: {
                return 'Aborted';
            }
            default: {
                break;
            }
        }
    }

    //const [aborted, setAborted] = useState(false);

    return (
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '2px solid white', boxShadow: '0px 2px 12px 2px rgba(0,0,0,0.83)' }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flexGrow: '1', position: 'relative' }}>
                    <LinearProgress variant={status === DownloadStatus.AcquiringMetaData ? 'indeterminate' : 'determinate'} value={status === DownloadStatus.Aborted ? 0 : percentageCompleted * 100} />

                    <div className="image-container">
                        <AnimatedClippedImage imageUrl={thumbnailUrl} percentage={percentageCompleted * 100} aborted={status === DownloadStatus.Aborted}/>
                    </div>
                    <div style={{position: 'absolute', bottom: 10, left: 10, fontSize: 20, backgroundColor: 'white', fontWeight: 700, padding: '2px 5px', borderRadius: 5}}>
                        {getStatusText(status, Math.floor(percentageCompleted * 100))}
                    </div>
                    {/* <ProgressBar striped animated style={{ marginTop: 0, borderRadius: 0 }} variant={percentageCompleted >= 1 ? 'success' : 'info'} now={downloadPercent} /> */}
                </div>
                <VideoTaskMenu onAbortClicked={abortDownload} onClearClicked={() => null} onOpenFolderClicked={openFolder} />
            </div>

        </div>);
}