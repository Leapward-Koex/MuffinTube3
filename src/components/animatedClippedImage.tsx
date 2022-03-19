import { useCallback, useEffect, useRef, useState } from 'react';

type AnimatedClippedImageProps = {
    aborted?: boolean;
    imageUrl: string;
    percentage: number; // 0 - 100
}

export const AnimatedClippedImage = ({ imageUrl, percentage, aborted }: AnimatedClippedImageProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageHeight, setImageHeight] = useState(0);
    const [imageWidth, setImageWidth] = useState(0);

    // For animating downloading
    const animationElapsedRef = useRef(0);
    const previousImageWidth = useRef(0);
    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();

    // For animating aborting
    const abortRef = useRef<number>();
    const previousImageHeight = useRef(0);

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvas = canvasRef.current;
    const image = imageRef.current;

    const timeToAnimateBlock = 1000;

    function usePrevious(value: number) {
        const ref = useRef(0);
        useEffect(() => {
          ref.current = value;
        });
        return ref.current;
    }

    const prevCount = usePrevious(percentage);

    const easeing = (x: number) => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    const onImageLoaded = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageHeight(event.currentTarget.height);
        setImageWidth(event.currentTarget.width);
        setImageLoaded(true);
    }

    const animatePercent = useCallback((time: DOMHighResTimeStamp) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current; // Time elapsed in ms
            animationElapsedRef.current += deltaTime; // Time elapsed since start of animation
            const deltaPercent = percentage - prevCount; // Percent of total width of how far we need to animate in timeToAnimateBlock in ms
            const animationElapsedPercent = easeing(animationElapsedRef.current / timeToAnimateBlock); // Percent of how far we're though the animation
            const newPercent = (animationElapsedPercent * deltaPercent) + prevCount;

            const imageWidthSlice = imageWidth * (newPercent / 100);
            
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
            requestRef.current = requestAnimationFrame(animatePercent);
        }

    }, [canvas, image, imageHeight, imageLoaded, imageWidth, percentage, prevCount]);

    const animateAbort = useCallback((time: DOMHighResTimeStamp) => {
        if (previousTimeRef.current !== undefined) {
            if (canvas && image && imageLoaded) {
                const imageScaleFactor = image.clientWidth / imageWidth;

                const deltaTime = time - previousTimeRef.current; // Time elapsed in ms
                animationElapsedRef.current += deltaTime; // Time elapsed since start of animation
                const animationElapsedPercent = easeing(animationElapsedRef.current / 1500); // Percent of how far we're though the animation (0-1)
                const visibleImageHeight = image.clientHeight / imageScaleFactor;
                const nonVisibleImageHeight = (imageHeight - visibleImageHeight) / 2; // How many pixels are offscreen and not visible (per side)
                const newImageHeight = (animationElapsedPercent * visibleImageHeight) + nonVisibleImageHeight; // How many pixels through the animation we are.

                const context = canvas.getContext('2d')
                if (context) {
                    if (animationElapsedRef.current / 1500 < 1) {
                        context.drawImage(image, 0, 0, imageWidth, newImageHeight + 1, 0, 0, imageWidth, newImageHeight + 1);
                        previousImageHeight.current = newImageHeight;

                    }
                    else {
                        context.drawImage(image, 0, 0, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
                        previousImageHeight.current = imageHeight;
                    }
                }
            }
        }
        if (previousImageHeight.current + 1 <= imageHeight) {
            previousTimeRef.current = time;
            abortRef.current = requestAnimationFrame(animateAbort);
        }

    }, [canvas, image, imageHeight, imageLoaded, imageWidth]);

    useEffect(() => {
        if (!aborted) {
            requestRef.current = requestAnimationFrame(animatePercent);
            previousTimeRef.current = undefined;
            animationElapsedRef.current = 0;
        }
        else {
            cancelAnimationFrame(requestRef.current!)
        }
        return () => cancelAnimationFrame(requestRef.current!);

    }, [aborted, animatePercent]);

    useEffect(() => {
        if (aborted) {
            console.log('aborted')
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
            }
            if (canvas) {
                const context = canvas.getContext('2d')
                if (context) {
                    context.filter = 'grayscale(1)';
                }
            }
            
            previousTimeRef.current = undefined;
            animationElapsedRef.current = 0;
            abortRef.current = requestAnimationFrame(animateAbort);
        }

        return () => cancelAnimationFrame(abortRef.current!);
    }, [aborted, animateAbort, canvas]);

    return (
        <div style={{ position: 'relative', height: '300px' }}>
            <img alt='' ref={imageRef} src={imageUrl} onLoad={(event) => onImageLoaded(event)} style={{ filter: 'grayscale(100%) blur(1px) brightness(0.8)', display: imageLoaded ? 'block' : 'none', position: 'absolute', height: '100%', width: '100%', objectFit: 'cover' }}>
            </img>
            <canvas ref={canvasRef} width={imageWidth} height={imageHeight} style={{ display: imageLoaded ? 'block' : 'none', position: 'absolute', height: '100%', width: '100%', objectFit: 'cover'}} />
        </div>);
}