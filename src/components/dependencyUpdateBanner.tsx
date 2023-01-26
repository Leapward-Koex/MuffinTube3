import { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';
import Slide, { SlideProps } from '@mui/material/Slide';
import { jsApi } from '../apiService/agnosticJsApi';

type TransitionProps = Omit<SlideProps, 'direction'>;
function TransitionUp(props: TransitionProps) {
    return <Slide {...props} direction="up"></Slide>;
}

export const DependencyUpdateBanner = () => {
    const [visible, setVisible] = useState(false);
    const [transition] = useState<React.ComponentType<TransitionProps>>(() => TransitionUp);
    const [message, setMessage] = useState('');
    const [totalDownloadSize, setTotalDownloadSize] = useState(0);
    const [resolvedDownloadSize, setResolvedDownloadSize] = useState(0);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        jsApi.addYtdlDependencyListeners(
            () => {
                setMessage('Checking for YTDL dependency updates...');
                setVisible(true);
            },
            (totalSize) => {
                if (totalSize > 0) {
                    setMessage('Downloading dependency update...');
                    setTotalDownloadSize(totalSize);
                }
            },
            (value) => {
                if (totalDownloadSize > 0) {
                    setResolvedDownloadSize((currentValue) => currentValue + value);
                }
            },
            (value) => {
                if (totalDownloadSize > 0) {
                    setResolvedDownloadSize((currentValue) => currentValue + value);
                }
            },
            () => {
                setMessage('Finished checking for updates');
                timeout = setTimeout(() => setVisible(false), 5000)
            }
            )
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            jsApi.removeYtdlDependencyListeners()
        }
    }, [totalDownloadSize])


    return (
    <>
    <button onClick={() => setVisible(!visible)}>Click</button>
        <Snackbar open={visible} autoHideDuration={6000} sx={{bottom: '15px!important', left: '15px!important', right: '15px!important' }} onClose={() => setVisible(false)}
            TransitionComponent={transition}
        >
            <div style={{backgroundColor: 'whitesmoke', width: '100%', display: 'flex', flexDirection: 'row', borderRadius: 8, padding: 8}}>
                <CircularProgress style={{padding: 10}} variant="determinate" value={(totalDownloadSize / resolvedDownloadSize) * 100} />
                <Typography>{message}</Typography>
            </div>
        </Snackbar>
    </>);
}