import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/downloadTask.css'
import { VideoInput } from './components/videoInput';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DownloadStatus, DownloadTask } from './components/downloadTask';
import { StrictMode } from 'react';
import { Settings } from './components/settings';
import { useState } from 'react';
import { useTransition, animated } from "react-spring";
import { DependencyUpdateBanner } from './components/dependencyUpdateBanner';
import { jsApi } from './apiService/agnosticJsApi';
import useWindowDimensions from './hooks/getWindowDimensions';
// import { Title } from './components/title';

export interface DownloadTaskItem { 
    videoCallbackId: string,
    thumbnailUrl: string,
    videoTitle: string,
    percentComplete: number
    status: DownloadStatus,
    mp3Path: string
}

const padding = '20px';
export const App = () => {
    const [downloadTasks, setDownloadTasks] = useState<DownloadTaskItem[]>([]);
	const { width } = useWindowDimensions();

    const updateVideoStatus = (callbackId: string, update: { videoStatus: DownloadStatus, destinationPath?: string }) => {
        const matchingTask = downloadTasks.find((task) => task.videoCallbackId === callbackId);
        if (matchingTask) {
            matchingTask.status = update.videoStatus;
            if (update.destinationPath) {
                matchingTask.mp3Path = update.destinationPath;
            }
            setDownloadTasks([...downloadTasks]);
        }
    }

    const onVideoSubmitted = async (videoUrl: string, thumbnailUrl: string) => {
        const videoDownloadTask = jsApi.startDownloadTask(videoUrl);

        downloadTasks.unshift({videoCallbackId: videoDownloadTask.callbackId, thumbnailUrl: '', videoTitle: '', percentComplete: 0, status: DownloadStatus.AcquiringMetaData, mp3Path: ''});
        setDownloadTasks([...downloadTasks]);

        videoDownloadTask.metaData.then((metaData) => {
            const matchingTask = downloadTasks.find((task) => task.videoCallbackId === videoDownloadTask.callbackId);
            if (matchingTask) {
                matchingTask.thumbnailUrl = metaData.imageUrl;
                matchingTask.status = DownloadStatus.DownloadingAudio;
                matchingTask.videoTitle = metaData.title;
                setDownloadTasks([...downloadTasks]);
            }
        });
        videoDownloadTask.downloaded.then(() => {
            updateVideoStatus(videoDownloadTask.callbackId, { videoStatus: DownloadStatus.ConvertingAudio });
        })
        videoDownloadTask.onData((percentageComplete) => {
            const matchingTask = downloadTasks.find((task) => task.videoCallbackId === videoDownloadTask.callbackId);
            if (matchingTask) {
                matchingTask.percentComplete = percentageComplete;
                setDownloadTasks([...downloadTasks]);
            }
        });
        videoDownloadTask.taskFinished.then((destinationPath) => {
            updateVideoStatus(videoDownloadTask.callbackId, { videoStatus: DownloadStatus.Finished, destinationPath });
        });
    }

    const onVideoAborted = (callbackId: string) => {
        jsApi.abortDownload(callbackId);
        updateVideoStatus(callbackId, { videoStatus: DownloadStatus.Aborted });
    }

    const onClearClicked = (callbackId: string) => {
        setDownloadTasks([...downloadTasks.filter((task) => task.videoCallbackId !== callbackId)])
    }

    const theme = createTheme({
        palette: {
            primary: {
                main: '#b70077', // Vibrant pink-purple
            },
            secondary: {
                main: '#36a39d', // Green
            },
        },
    });

    let height = 0;
    const downloadTaskHeight = Math.min(width / 2.5, 300) + 50
    const transitions = useTransition(
        downloadTasks.map((task, i) =>  {
            height += downloadTaskHeight;
            return { ...task, y: height - downloadTaskHeight }
        }),
        {
            key: (task: DownloadTaskItem) => task.videoCallbackId,
            from: { opacity: 0, y: -downloadTaskHeight, x: 0 },
            leave: { height: 0, opacity: 0, y: -downloadTaskHeight / 2 },
            enter: ({ y }) => ({ y, opacity: 1 }),
            update: ({ y }) => ({ y })
        }
    );

    return (
        <StrictMode>
            <ThemeProvider theme={theme}>
                <Container className="App">
                    <div className='settingContainer' style={{position: 'absolute', top: 10, left: 10}}>
                        <Settings />
                    </div>
                    {/* <Title /> */}
                    <div className="video-input-container" style={{ padding }}>
                        <VideoInput onSubmit={(videoUrl, thumbnailUrl) => onVideoSubmitted(videoUrl, thumbnailUrl)}></VideoInput>
                    </div>
                    <Stack spacing={0} className="downloads-container" style={{position: 'relative'}}>
                    {transitions(({x, y, ...rest}, item, key) => {
                        return (<animated.div  style={{
                            transform: y.to((y: number)  => `translate3d(0,${y}px,0)`),
                            position: 'absolute',
                            width: '100%',
                            ...rest
                        }}>
                                <DownloadTask
                                videoCallbackId={item.videoCallbackId}
                                thumbnailUrl={item.thumbnailUrl}
                                videoTitle={item.videoTitle}
                                percentageCompleted={item.percentComplete}
                                status={item.status}
								mp3Path={item.mp3Path}
                                abortDownload={() => onVideoAborted(item.videoCallbackId)}
                                openFolder={() => jsApi.openFileInExplorer(item.mp3Path)}
                                clearClicked={() => onClearClicked(item.videoCallbackId)}
                                />
                        </animated.div>)
                    })}
                    </Stack>
                    <DependencyUpdateBanner />
                </Container >
            </ThemeProvider>
        </StrictMode>
    );
}
