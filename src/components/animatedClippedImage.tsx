import TextField from '@mui/material/TextField';
import { useEffect, useRef, useState } from 'react';

type AnimatedClippedImageProps = {
    imageUrl: string;
    percentage: number;
}

export const AnimatedClippedImage = ({ imageUrl, percentage }: AnimatedClippedImageProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image && imageLoaded) {
        const context = canvas.getContext('2d')
        if (context) {
            context.drawImage(image, 0, 0, 1280 * (percentage / 100), 720, 0, 0, 1280 * (percentage / 100), 720) 
        }
    }

    return (
    <div style={{position: 'relative'}}>
        <img ref={imageRef} src={imageUrl} onLoad={() => setImageLoaded(true)} style={{filter: 'grayscale(100%) blur(2px) brightness(0.8)', display: imageLoaded ? 'block': 'none', position: 'absolute'}}>
        </img>
        <canvas ref={canvasRef} width={1280} height={720} style={{display: imageLoaded ? 'block': 'none', position: 'absolute'}}/>
    </div>);
}