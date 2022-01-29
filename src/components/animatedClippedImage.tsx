import TextField from '@mui/material/TextField';
import { useCallback, useEffect, useRef, useState } from 'react';

type AnimatedClippedImageProps = {
    imageUrl: string;
    percentage: number;
}

export const AnimatedClippedImage = ({ imageUrl, percentage }: AnimatedClippedImageProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const animationElapsedRef = useRef(0);
    const previousImageWidth = useRef(0);
    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvas = canvasRef.current;
    const image = imageRef.current;

    const imageWidth = 1920;
    const imageHeight = 1200;
    const timeToAnimateBlock = 400;

    function usePrevious(value: number) {
        const ref = useRef(0);
        useEffect(() => {
          ref.current = value;
        });
        return ref.current;
    }

    const prevCount = usePrevious(percentage);

    function easeing(x: number): number {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    const animate = useCallback((time: DOMHighResTimeStamp) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current; // time elapse in ms
            animationElapsedRef.current += deltaTime; // time elapsed since start of animation
            const deltaPercent = percentage - prevCount; // how far we need to animate in 500ms (in percent of total width)
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
        if (percentage < 100) {
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        }

    }, [canvas, image, imageLoaded, percentage, prevCount])

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        previousTimeRef.current = undefined;
        animationElapsedRef.current = 0;
        return () => cancelAnimationFrame(requestRef.current!);
    }, [animate]);

    return (
        <div style={{ position: 'relative' }}>
            <img ref={imageRef} src={imageUrl} onLoad={() => setImageLoaded(true)} style={{ filter: 'grayscale(100%) blur(1px) brightness(0.8)', display: imageLoaded ? 'block' : 'none', position: 'absolute' }}>
            </img>
            <canvas ref={canvasRef} width={imageWidth} height={imageHeight} style={{ display: imageLoaded ? 'block' : 'none', position: 'absolute' }} />
        </div>);
}