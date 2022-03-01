import TextField from '@mui/material/TextField';
import { useCallback, useEffect, useRef, useState } from 'react';

type AnimatedClippedImageProps = {
    imageUrl: string;
    percentage: number; // 0 - 100
}

export const AnimatedClippedImage = ({ imageUrl, percentage }: AnimatedClippedImageProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageHeight, setImageHeight] = useState(0);
    const [imageWidth, setImageWidth] = useState(0);

    const animationElapsedRef = useRef(0);
    const previousImageWidth = useRef(0);
    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvas = canvasRef.current;
    const image = imageRef.current;

    const timeToAnimateBlock = 400;

    function usePrevious(value: number) {
        const ref = useRef(0);
        useEffect(() => {
          ref.current = value;
        });
        return ref.current;
    }

    const prevCount = usePrevious(percentage);

    const easeing = (x: number) => {
        return -(Math.cos(Math.PI * x) - 1) / 2; //easeInOutSine
    }

    const onImageLoaded = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageHeight(event.currentTarget.height);
        setImageWidth(event.currentTarget.width);
        setImageLoaded(true);
    }

    const animate = useCallback((time: DOMHighResTimeStamp) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current; // Time elapsed in ms
            animationElapsedRef.current += deltaTime; // Time elapsed since start of animation
            const deltaPercent = percentage - prevCount; // Percent of total width of how far we need to animate in timeToAnimateBlock in ms
            const animationElapsedPercent = easeing(animationElapsedRef.current / timeToAnimateBlock); // Percent of how far we're though the animation
            const newPercent = (animationElapsedPercent * deltaPercent) + prevCount;

            const imageWidthSlice = Math.min(imageWidth * (newPercent / 100));
            
            if (canvas && image && imageLoaded) {
                const context = canvas.getContext('2d')
                if (context) {
                    context.drawImage(image, previousImageWidth.current, 0, imageWidthSlice - previousImageWidth.current + 1, imageHeight, previousImageWidth.current, 0, imageWidthSlice - previousImageWidth.current + 1, imageHeight);
                    previousImageWidth.current = imageWidthSlice;
                }
            }
        }
        if (percentage <= 100) {
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        }

    }, [canvas, image, imageHeight, imageLoaded, imageWidth, percentage, prevCount]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        previousTimeRef.current = undefined;
        animationElapsedRef.current = 0;
        return () => cancelAnimationFrame(requestRef.current!);
    }, [animate]);

    return (
        <div style={{ position: 'relative', height: '300px' }}>
            <img ref={imageRef} src={imageUrl} onLoad={(event) => onImageLoaded(event)} style={{ filter: 'grayscale(100%) blur(1px) brightness(0.8)', display: imageLoaded ? 'block' : 'none', position: 'absolute', height: '100%', width: '100%', objectFit: 'cover' }}>
            </img>
            <canvas ref={canvasRef} width={imageWidth} height={imageHeight} style={{ display: imageLoaded ? 'block' : 'none', position: 'absolute', height: '100%', width: '100%', objectFit: 'cover'}} />
        </div>);
}