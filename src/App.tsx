import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/downloadTask.css'
import { VideoInput } from './components/videoInput';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DownloadStatus, DownloadTask } from './components/downloadTask';
import { electronJsApi } from './apiService/electronJsApi';
import { StrictMode } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import Fab from '@mui/material/Fab';
import { Settings } from './components/settings';
import { useState } from 'react';

const padding = '20px';
export const App = () => {
    const [downloadTasks, setDownloadTasks] = useState<{ videoCallbackId: string, thumbnailUrl: string, percentComplete: number, status: DownloadStatus, mp3Path: string }[]>([]);


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
        const videoDownloadTask = electronJsApi.startDownloadTask(videoUrl);

        downloadTasks.push({videoCallbackId: videoDownloadTask.callbackId, thumbnailUrl: '', percentComplete: 0, status: DownloadStatus.AcquiringMetaData, mp3Path: ''});
        setDownloadTasks([...downloadTasks]);

        videoDownloadTask.metaData.then((metaData) => {
            const matchingTask = downloadTasks.find((task) => task.videoCallbackId === videoDownloadTask.callbackId);
            if (matchingTask) {
                matchingTask.thumbnailUrl = metaData.thumbnail;
                matchingTask.status = DownloadStatus.DownloadingAudio;
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
        electronJsApi.abortDownload(callbackId);
        updateVideoStatus(callbackId, { videoStatus: DownloadStatus.Aborted });
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
    })

    return (
        <StrictMode>
            <ThemeProvider theme={theme}>
                <Container className="App">
                    <div className='settingContainer' style={{position: 'absolute', top: 10, left: 10}}>
                        <Settings />
                    </div>
                    {/* <div className='title' style={{ padding: '20px' }}>
                        <div className="centered">
                            <div className="lazer84">MuffinTube-3</div>
                        </div>
                        <svg style={{ position: 'absolute' }}>
                            <defs>
                                <circle id="circle" cx="80%" cy="80%" r="20%" fill="#ce00df" />
                                <filter id="fakeHalftone" width="150%" height="150%" >
                                    <feImage x="0" y="0" width="1%" height="1%" xlinkHref='#circle' result="circle"></feImage>
                                    <feTile result="pattern" />
                                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" seed="1" stitchTiles="stitch" result="noise" />
                                    <feColorMatrix in="noise"
                                        type="saturate"
                                        values="0" result="desaturatedNoise" />
                                    <feComponentTransfer in="desaturatedNoise" result="mask">
                                        <feFuncA type="discrete" tableValues="0 1" />
                                    </feComponentTransfer>

                                    <feComposite in="pattern" in2="mask" operator="in" ></feComposite>

                                    <feComposite in2="SourceGraphic" in="pattern1" operator="in" ></feComposite>
                                    <feOffset dx="5" result="halftone1"></feOffset>

                                    <feOffset dx="-2" dy="3" result="halftone2"></feOffset>
                                    <feFlood floodColor="#6b0547" result="color" />
                                    <feComposite in="color" in2="halftone2" operator="in" result="halftone2"></feComposite>


                                    <feMerge result="halftone">
                                        <feMergeNode in="SourceGraphic"></feMergeNode>
                                        <feMergeNode in="halftone2"></feMergeNode>
                                        <feMergeNode in="halftone1"></feMergeNode>

                                    </feMerge>

                                    <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="BEVEL_10" />
                                    <feConvolveMatrix order="3,3" kernelMatrix="1 0 0 
            0 1 0
            0 0 1" in="BEVEL_10" result="BEVEL_20" />
                                    <feOffset dx="0" dy="0" in="BEVEL_20" result="BEVEL_30" />
                                    <feComposite operator="in" in="BEVEL_20" result="BEVEL_30" />
                                    <feOffset dx="2" dy="2" in="BEVEL_20" result="BEVEL_30" />
                                    <feOffset dx="4" dy="4" in="BEVEL_20" result="BEVEL_40" />
                                    <feOffset dx="8" dy="8" in="BEVEL_20" result="BEVEL_50" />
                                    <feFlood floodColor="#060469" result="color1"></feFlood>
                                    <feFlood floodColor="#36a39d" result="color2"></feFlood>
                                    <feFlood floodColor="#4200ff" result="color3"></feFlood>
                                    <feComposite in2="BEVEL_30" in="color1" operator="in" result="bevel1"></feComposite>
                                    <feComposite in2="BEVEL_40" in="color2" operator="in" result="bevel2"></feComposite>
                                    <feComposite in2="BEVEL_50" in="color3" operator="in" result="bevel3"></feComposite>
                                    <feGaussianBlur stdDeviation="13 2" result="blurryEdge" />
                                    <feMerge>
                                        <feMergeNode in="blurryEdge"></feMergeNode>
                                        <feMergeNode in="bevel3"></feMergeNode>
                                        <feMergeNode in="bevel2"></feMergeNode>
                                        <feMergeNode in="bevel1"></feMergeNode>

                                        <feMergeNode in="halftone"></feMergeNode>
                                    </feMerge>

                                </filter>

                                <filter id="sideBlur" width="200%">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="20 0" result="blurryEdge" />
                                </filter>

                                <filter id="noise" x="0vw" y="0vh" width="100vw" height="100vh">
                                    <feFlood floodColor="#808080" result="neutral-gray" />
                                    <feTurbulence in="neutral-gray" type="fractalNoise" baseFrequency="0.8" numOctaves="10" stitchTiles="stitch" result="noise" />
                                    <feColorMatrix in="noise" type="saturate" values="0" result="destaturatedNoise"></feColorMatrix>
                                    <feComponentTransfer in="desaturatedNoise" result="theNoise">
                                        <feFuncA type="table" tableValues="0 0 0.2 0"></feFuncA>
                                    </feComponentTransfer>
                                    <feBlend in="SourceGraphic" in2="theNoise" mode="soft-light" result="noisy-image" />
                                </filter>
                            </defs>
                        </svg>
                    </div> */}
                    <div className="video-input-container" style={{ padding }}>
                        <VideoInput onSubmit={(videoUrl, thumbnailUrl) => onVideoSubmitted(videoUrl, thumbnailUrl)}></VideoInput>
                    </div>
                    <Stack spacing={2} className="downloads-container">
                        {downloadTasks.map((downloadTask, index) => {
                            return <DownloadTask
                            key={index}
                            thumbnailUrl={downloadTask.thumbnailUrl}
                            percentageCompleted={downloadTask.percentComplete}
                            status={downloadTask.status}
                            abortDownload={() => onVideoAborted(downloadTask.videoCallbackId)}
                            openFolder={() => electronJsApi.openFileInExplorer(downloadTask.mp3Path)}
                            />
                        })}
                        {/* <DownloadTask thumbnailUrl={''} percentageCompleted={0} status={DownloadStatus.DownloadingAudio} abortDownload={() => null} openFolder={() => null} /> */}
                    </Stack>
                </Container >
            </ThemeProvider>
        </StrictMode>
    );
}
