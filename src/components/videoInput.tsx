import { Input } from '@mui/material';
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

    const onKeyDownHandler = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (event.key === "Enter") {
            const videoId = extractVideoId(videoUrl);
            if (videoId) {
                onSubmit(videoId)
            }
        }
    }

    return <Input
        autoFocus
        onKeyDown={(event) => onKeyDownHandler(event)}
        onChange={(event) => setVideoUrl(event.target.value)}
        autoComplete='off'
        style={{
            backgroundColor: "white",
            width: '100%',
            height: '50px',
            borderRadius: '10px'
        }}
        inputProps={{
            style: {
                color: "red"
            }
        }}
        color="secondary"
        id="outlined-basic"
         />
}