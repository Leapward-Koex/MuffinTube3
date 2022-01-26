import React from 'react';
import logo from './logo.svg';
import './App.css';
import { VideoInput } from './components/videoInput';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { DownloadTask } from './components/downloadTask';

export const App = () => {

    const onVideoSubmitted = (videoId: string) => {
        const thumbnailUrl = `https://img.youtube.com/vi/l4WjAiBFYjw/maxresdefault.jpg`
    }
    // l4WjAiBFYjw

    return (
        <Container className="App" style={{ width: 400 }}>
            <div className="video-input-container">
                <VideoInput onSubmit={(videoId) => onVideoSubmitted(videoId)}></VideoInput>
            </div>
            <Stack spacing={2} className="downloads-container">
                <DownloadTask videoId={'l4WjAiBFYjw'} onCompleted={() => {}}/>
            </Stack>
        </Container >
    );
}
