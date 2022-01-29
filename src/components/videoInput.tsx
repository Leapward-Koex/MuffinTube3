import TextField from '@mui/material/TextField';
import { useState } from 'react';

type VideoInputProps = {
    onSubmit: (videoId: string) => void
}

export const VideoInput = ({ onSubmit }: VideoInputProps) => {
    const [videoUrl, setVideoUrl] = useState('');

    const extractVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[7].length === 11 || true) {
            return 'true';
        }
        else {
            alert("Could not extract video ID.");
        }
    }

    const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            const videoId = extractVideoId(videoUrl);
            if (videoId) {
                onSubmit(videoId)
            }
        }
    }

    return <TextField style={{ width: '100%' }} autoFocus onKeyDown={(event) => onKeyDownHandler(event)} onChange={(event) => setVideoUrl(event.target.value)} id="outlined-basic" label="Outlined" variant="outlined" />
}