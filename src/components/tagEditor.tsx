import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { electronJsApi } from '../apiService/electronJsApi';

type TagEditorProps = {
    videoCallbackId: string,
    initialVideoTitle: string,
    onClose: () => void
}
export const TagEditor = ({videoCallbackId, initialVideoTitle, onClose}: TagEditorProps) => {
    const [songTitle, setSongTitle] = useState('');
    const [artistName, setArtistName] = useState('');

    if (initialVideoTitle && !songTitle) {
        setSongTitle(initialVideoTitle);
    }

    const handleSaveClicked = () => {
        electronJsApi.setSongTags(videoCallbackId, songTitle, artistName);
        onClose();
    }
    
    return (
    <>
    <div style={{display: 'flex', flexDirection: 'column', padding: 20, paddingLeft: 30, paddingRight: 70, width: '100%', height: '100%', margin: 'auto', backgroundColor: 'whitesmoke'}}>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: '1'}}>
            <TextField value={songTitle} onChange={(event) => setSongTitle(event.target.value)} label={'Song title'} variant="standard" />
            <TextField value={artistName} onChange={(event) => setArtistName(event.target.value)} style={{marginTop: 10}} label={'Artist name'} variant="standard" /> 
        </div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Button endIcon={<SaveIcon />} color='primary' onClick={() => handleSaveClicked()}>Save</Button>
        </div>
    </div>

    </>
    )
}