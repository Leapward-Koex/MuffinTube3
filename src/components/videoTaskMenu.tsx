import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import FolderOpen from '@mui/icons-material/FolderOpen';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';

type VideoTaskMenuProps = {
    onClearClicked: () => void;
    onOpenFolderClicked: () => void;
    onAbortClicked: () => void;
}

export const VideoTaskMenu = ({ onAbortClicked, onOpenFolderClicked, onClearClicked }: VideoTaskMenuProps) => {

    return <div style={{ width: 50, backgroundColor: 'white' }}>
    <MenuList style={{height: '100%'}}>
        <MenuItem disabled onClick={() => onClearClicked()}>
            <ListItemIcon>
                <DoneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Clear</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onOpenFolderClicked()}>
            <ListItemIcon>
                <FolderOpen fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open containing folder</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => onAbortClicked()}>
            <ListItemIcon>
                <ClearIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Abort</ListItemText>
        </MenuItem>
        <Divider />
    </MenuList>
</div>
}