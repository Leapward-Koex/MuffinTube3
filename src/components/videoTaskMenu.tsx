import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import FolderOpen from '@mui/icons-material/FolderOpen';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import Tooltip from '@mui/material/Tooltip';
import { DownloadStatus } from './downloadTask';

type VideoTaskMenuProps = {
    onClearClicked: () => void;
    onOpenFolderClicked: () => void;
    onAbortClicked: () => void;
    onEditClicked: () => void;
    status: DownloadStatus;
}

export const VideoTaskMenu = ({ onAbortClicked, onOpenFolderClicked, onClearClicked, onEditClicked, status }: VideoTaskMenuProps) => {
    return (<div style={{ width: 50, backgroundColor: 'white', zIndex: 2 }}>
        <MenuList style={{ height: '100%' }}>
            {
                status === DownloadStatus.Finished || status === DownloadStatus.Aborted || true ?
                    (
                        <Tooltip title="Clear item">
                            <MenuItem onClick={() => onClearClicked()}>
                                <ListItemIcon>
                                    <DoneIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Clear</ListItemText>
                            </MenuItem>
                        </Tooltip>
                    )
                    : (
                        <Tooltip title="Abort download">
                            <MenuItem disabled={status === DownloadStatus.AcquiringMetaData} onClick={() => onAbortClicked()}>
                                <ListItemIcon>
                                    <ClearIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Abort</ListItemText>
                            </MenuItem>
                        </Tooltip>
                    )
            }
            <Tooltip title="Open Containing folder">
                <MenuItem disabled={status !== DownloadStatus.Finished} onClick={() => onOpenFolderClicked()}>
                    <ListItemIcon>
                        <FolderOpen fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Open containing folder</ListItemText>
                </MenuItem>
            </Tooltip>
            <Tooltip title="Edit tags">
                <MenuItem disabled={status === DownloadStatus.Aborted} onClick={() => onEditClicked()}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit tags</ListItemText>
                </MenuItem>
            </Tooltip>
            <Divider />
        </MenuList>
    </div>)
}