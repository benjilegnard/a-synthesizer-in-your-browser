import { FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { flavors } from "@catppuccin/palette";
import { STROKE_WIDTH } from '../common/constants';
const { colors } = flavors.mocha;
const BACKGROUND_COLOR = colors.crust.hex;
const LINE_COLOR = colors.surface0.hex;

// Waveform visualization component
interface WaveformVisualizerProps {
    analyserNode: AnalyserNode | null;
    width?: number;
    height?: number;
}

export const WaveformVisualizer: FunctionComponent<WaveformVisualizerProps> = ({
    analyserNode,
    width = 600,
    height = 200
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (!analyserNode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        // Create a buffer for the waveform data
        const bufferLength = analyserNode.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            // Request next animation frame
            animationRef.current = requestAnimationFrame(draw);

            // Get waveform data
            analyserNode.getByteTimeDomainData(dataArray);

            // Clear canvas
            canvasCtx.fillStyle = BACKGROUND_COLOR;
            canvasCtx.fillRect(0, 0, width, height);

            // Draw waveform
            canvasCtx.lineWidth = STROKE_WIDTH;
            canvasCtx.strokeStyle = LINE_COLOR;
            canvasCtx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(width, height / 2);
            canvasCtx.stroke();
        };

        draw();

        // Cleanup
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyserNode, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
        />
    );
};
