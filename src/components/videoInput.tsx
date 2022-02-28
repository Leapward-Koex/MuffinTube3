import { Input } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

type VideoInputProps = {
    onSubmit: (videoId: string) => void
}

export const VideoInput = ({ onSubmit }: VideoInputProps) => {
    const [videoUrl, setVideoUrl] = useState('');

    const onKeyDownHandler = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (videoUrl) {
                onSubmit(videoUrl);
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