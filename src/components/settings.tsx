import TextField from '@mui/material/TextField';
import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import { electronJsApi } from '../apiService/electronJsApi';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { settingsKey } from '../sharedEnums';

export const Settings = () => {
    const [open, setOpen] = useState(false);
    const [downloadLocation, setDownloadLocation] = useState('');
    const [ytdlVariant, setYtdlVariant] = useState<'ytdl' | 'ytdlp'>();

    const handleClickOpen = async () => {
        const [savedDownloadLocation, savedYtdlVariant] = await Promise.all([electronJsApi.getSetting(settingsKey.downloadPath), electronJsApi.getSetting(settingsKey.ytdlVariant)])
        if (savedDownloadLocation) {
            setDownloadLocation(savedDownloadLocation);
        }
        if (savedYtdlVariant) {
            setYtdlVariant(savedYtdlVariant as any)
        }
        setOpen(true);
    };

    const handleFolderPickerClicked = () => {
        electronJsApi.openFolderPicker().then((selectedFolder) => {
            if (selectedFolder) {
                setDownloadLocation(selectedFolder);
            }
        })
    }

    const handleClose = (savePath: boolean) => {
        setOpen(false);
        if (savePath) {
            electronJsApi.setSetting(settingsKey.downloadPath, downloadLocation)
        }
        if (ytdlVariant) {
            electronJsApi.setSetting(settingsKey.ytdlVariant, ytdlVariant)
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
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Download location"
                            placeholder='C:\Users\<Username>\Music\'
                            fullWidth
                            autoComplete='off'
                            variant="standard"
                            value={downloadLocation}
                            onChange={(event) => setDownloadLocation(event.target.value)}
                        />
                        <Tooltip title="Open folder select window">
                            <IconButton style={{margin: 20}} color='primary' onClick={() => handleFolderPickerClicked()}>
                                <FolderOpenIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <FormControl>
                        <FormLabel id="demo-radio-buttons-group-label">Youtube-dl variant</FormLabel>
                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            defaultValue="ytdlp"
                            row
                            value={ytdlVariant}
                            name="radio-buttons-group"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setYtdlVariant(event.target.value as any)}
                        >
                            <Tooltip title="A forked and modified version of Youtube-dl, can be significantly faster. Try this variant first.">
                                <FormControlLabel value="ytdlp" control={<Radio />} label="YT-DLP" />
                            </Tooltip>
                            <Tooltip title="Standard Youtube-dl, most likely to work but can be slow.">
                                <FormControlLabel value="ytdl" control={<Radio />} label="Youtube-dl" />
                            </Tooltip>

                        </RadioGroup>
                    </FormControl>
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
