import { Input } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';

export const Settings = () => {
    const [open, setOpen] = useState(false);
    const [downloadLocation, setDownloadLocation] = useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (savePath: boolean) => {
        setOpen(false);
        if (savePath) {

        }
    };

    return (
        <>
            <Fab size="small" style={{ backgroundColor: '#5F5F5F' }} aria-label="add" onClick={() => handleClickOpen()}>
                <SettingsIcon style={{ height: 30, width: 30 }} />
            </Fab>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ sx: { position: "fixed", top: 10, m: 0, width: 500 } }}
            >
                <DialogTitle id="alert-dialog-title">
                    {"MuffinTube Settings"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Download location"
                        placeholder='C:\Users\<Username>\Music\'
                        fullWidth
                        autoComplete='off'
                        variant="standard"
                        onChange={(event) => setDownloadLocation(event.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(true)}>Save</Button>
                    <Button onClick={() => handleClose(false)} autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>

    )

}
