import { AnimatedClippedImage } from './animatedClippedImage';
import { VideoTaskMenu } from './videoTaskMenu'
import LinearProgress from '@mui/material/LinearProgress';
import { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { TagEditor } from './tagEditor';

export enum DownloadStatus {
    AcquiringMetaData,
    DownloadingAudio,
    ConvertingAudio,
    Finished,
    Aborted
}

type DownloadTaskProps = {
    videoCallbackId: string;
    thumbnailUrl: string;
    percentageCompleted: number; // 0 - 1
    status: DownloadStatus;
    videoTitle: string;
    abortDownload: () => void;
    openFolder: () => void;
    clearClicked: () => void;
}

export const DownloadTask = ({ videoCallbackId, thumbnailUrl, percentageCompleted, status, videoTitle, abortDownload, openFolder, clearClicked }: DownloadTaskProps) => {
    const [showEditDialog, setShowEditDialog] = useState(false);

    const { transform } = useSpring({
        transform: `translate3d(${showEditDialog ? 0 : 100}%,0,0)`,
        config: { mass: 5, tension: 700, friction: 80 },
    })

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

    return (
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '2px solid white', boxShadow: '0px 2px 12px 2px rgba(0,0,0,0.83)', marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flexGrow: '1', position: 'relative' }}>
                    <LinearProgress variant={status === DownloadStatus.AcquiringMetaData ? 'indeterminate' : 'determinate'} value={status === DownloadStatus.Aborted ? 0 : percentageCompleted * 100} />
                    <div className="image-container">
                        <AnimatedClippedImage imageUrl={thumbnailUrl} percentage={percentageCompleted * 100} aborted={status === DownloadStatus.Aborted}/>
                    </div>
                    <div style={{position: 'absolute', bottom: 10, left: 10, fontSize: 20, backgroundColor: 'white', fontWeight: 700, padding: '2px 5px', borderRadius: 5}}>
                        {getStatusText(status, Math.floor(percentageCompleted * 100))}
                    </div>
                    <animated.div style={{
                        willChange: 'transform, opacity',
                        transform,
                        position: 'absolute',
                        height: '100%',
                        top: 4,
                        right: -40,
                        width: '420px'
                    }}>
                        <TagEditor videoCallbackId={videoCallbackId} initialVideoTitle={videoTitle} onClose={() => setShowEditDialog(false)} />
                    </animated.div>
                </div>
                <VideoTaskMenu onAbortClicked={abortDownload} onClearClicked={clearClicked} onOpenFolderClicked={openFolder} onEditClicked={() => setShowEditDialog(!showEditDialog)} status={status}/>
            </div>

        </div>);
}