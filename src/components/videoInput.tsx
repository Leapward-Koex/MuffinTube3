import TextField from '@mui/material/TextField';

type VideoInputProps = {
    onSubmit: string,
    paragraph: string
}

export const VideoInput = ({ title, paragraph }: VideoInputProps) => {
    return <TextField id="outlined-basic" label="Outlined" variant="outlined" />
}