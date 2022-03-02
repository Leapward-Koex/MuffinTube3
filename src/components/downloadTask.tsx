import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { AnimatedClippedImage } from './animatedClippedImage';
import ProgressBar from 'react-bootstrap/ProgressBar'
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import FolderOpen from '@mui/icons-material/FolderOpen';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';

export enum DownloadStatus {
    AcquiringMetaData,
    DownloadingAudio,
    ConvertingAudio,
    Finished,
}

type DownloadTaskProps = {
    thumbnailUrl: string;
    percentageCompleted: number; // 0 - 1
    status: DownloadStatus;
}

export const DownloadTask = ({ thumbnailUrl, percentageCompleted, status }: DownloadTaskProps) => {
    // const [downloadPercent, setDownloadPercent] = useState(0);

    // useEffect(() => {
    //     let interval: NodeJS.Timer;
    //     const timeout = setTimeout(() => {
    //         interval = setInterval(() => {
    //             setDownloadPercent((downloadPercent) => {
    //                 if (downloadPercent >= 99) {
    //                     clearInterval(interval);
    //                 }

    //                 return downloadPercent + 5
    //             });

    //         }, 500);
    //     }, 500)


    //     return () => {
    //         clearTimeout(timeout);
    //         clearInterval(interval);
    //     }
    // }, []);

    return (
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '2px solid white', boxShadow: '0px 2px 12px 2px rgba(0,0,0,0.83)' }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flexGrow: '1' }}>
                    <div className="image-container">
                        <AnimatedClippedImage imageUrl={thumbnailUrl} percentage={percentageCompleted * 100} />
                    </div>
                    <ProgressBar striped animated style={{ marginTop: 0, borderRadius: 0 }} variant={percentageCompleted >= 1 ? 'success' : 'info'} now={percentageCompleted * 100} />
                </div>
                <div style={{ width: 50, backgroundColor: 'white' }}>
                    <MenuList style={{height: '100%'}}>
                        <MenuItem disabled>
                            <ListItemIcon>
                                <DoneIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Clear</ListItemText>
                        </MenuItem>
                        <MenuItem>
                            <ListItemIcon>
                                <FolderOpen fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Open containingFolder</ListItemText>
                        </MenuItem>
                        
                        <MenuItem>
                            <ListItemIcon>
                                <ClearIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Abort</ListItemText>
                        </MenuItem>
                        <Divider />
                    </MenuList>
                </div>
            </div>

        </div>);
}