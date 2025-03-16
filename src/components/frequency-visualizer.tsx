// TODO audio visualizer
// @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

import { FunctionComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { flavors } from "@catppuccin/palette";
const { colors } = flavors.mocha;
const BACKGROUND_COLOR = colors.crust.hex;
const LINE_COLOR = flavors.mocha.colors.surface0.hex;
const COLORS = [
    colors.yellow.hex, colors.maroon.hex, colors.red.hex,
]
// Frequency visualization component
interface FrequencyVisualizerProps {
    analyserNode: AnalyserNode | null;
    width?: number;
    height?: number;
}

export const FrequencyVisualizer: FunctionComponent<FrequencyVisualizerProps> = ({
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

        // Create a buffer for the frequency data
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            // Request next animation frame
            animationRef.current = requestAnimationFrame(draw);

            // Get frequency data
            analyserNode.getByteFrequencyData(dataArray);

            // Clear canvas
            canvasCtx.fillStyle = BACKGROUND_COLOR;
            canvasCtx.fillRect(0, 0, width, height);

            // Draw frequency bars
            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                // Create gradient for bars
                const gradient = canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, 'rgb(0, 100, 200)');
                gradient.addColorStop(1, 'rgb(0, 200, 250)');

                canvasCtx.fillStyle = gradient;
                canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

                // Add gap between bars
                x += barWidth + 1;

                // Only render the bars that fit within the canvas width
                if (x > width) break;
            }
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
        <div>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ border: '1px solid #333', borderRadius: '4px' }}
            />
        </div>
    );
};
