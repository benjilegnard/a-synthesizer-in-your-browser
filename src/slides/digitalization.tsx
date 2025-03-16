import { FunctionalComponent } from "preact";

import { Graphics } from "../components/graphics";
import { SettingsPopup } from "../components/settings-popup";
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { HEIGHT, STROKE_WIDTH, WIDTH } from "../common/constants";

import { flavors } from "@catppuccin/palette";
import { FormField } from "../components/form-field";
const { colors } = flavors.mocha;

// Constants for SVG dimensions
const GRAPH_WIDTH = WIDTH - 100;
const GRAPH_HEIGHT = HEIGHT - 100;
const PADDING = 50;

interface DigitalSignalPoint {
    x: number;
    y: number;
    binaryValue: string;
}


export const Digitalization: FunctionalComponent = () => {

    // Configuration signals
    const bitDepth = useSignal(4); // Fixed 4-bit encoding as shown in the image
    const samplingCount = useSignal(16); // Number of samples across the time period

    // Derived signals
    const timeRange = useSignal(4); // 4ms as shown in the image
    const voltageRange = useSignal(4); // -2V to 2V = 4V range

    // Generate the analog signal - a sine wave with some variations
    const generateAnalogSignal = (timePoints: number): number[] => {
        return Array.from({ length: timePoints }, (_, i) => {
            const t = (i / (timePoints - 1)) * timeRange.value;
            // Complex waveform similar to the image
            return 2 * Math.sin(2 * Math.PI * t) +
                0.5 * Math.sin(6 * Math.PI * t) -
                0.3 * Math.sin(10 * Math.PI * t);
        });
    };

    // Quantize the analog signal to digital values
    const quantizeSignal = (
        analogSignal: number[],
        bitDepth: number
    ): DigitalSignalPoint[] => {
        const levels = Math.pow(2, bitDepth);
        const step = voltageRange.value / levels;

        return analogSignal.map((value, index) => {
            const normalizedValue = value + voltageRange.value / 2; // Shift to positive range
            const quantizedLevel = Math.floor(normalizedValue / step);
            const clampedLevel = Math.max(0, Math.min(levels - 1, quantizedLevel));

            // Convert to binary representation
            const binaryValue = clampedLevel.toString(2).padStart(bitDepth, '0');

            return {
                x: (index / (analogSignal.length - 1)) * (GRAPH_WIDTH - 2 * PADDING) + PADDING,
                y: GRAPH_HEIGHT - PADDING - ((value + voltageRange.value / 2) / voltageRange.value) * (GRAPH_HEIGHT - 2 * PADDING),
                binaryValue
            };
        });
    };

    // Create a "stair-step" digital representation from the quantized points
    const createDigitalSteps = (quantizedPoints: DigitalSignalPoint[]): { x: number; y: number }[] => {
        if (quantizedPoints.length < 2) return [];

        const steps: { x: number; y: number }[] = [];

        for (let i = 0; i < quantizedPoints.length - 1; i++) {
            // Current point
            steps.push({ x: quantizedPoints[i].x, y: quantizedPoints[i].y });
            // Horizontal line to next point
            steps.push({ x: quantizedPoints[i + 1].x, y: quantizedPoints[i].y });
        }

        // Add final point
        steps.push({
            x: quantizedPoints[quantizedPoints.length - 1].x,
            y: quantizedPoints[quantizedPoints.length - 1].y
        });

        return steps;
    };

    // Signals for derived data
    const analogSignal = useSignal<number[]>([]);
    const quantizedPoints = useSignal<DigitalSignalPoint[]>([]);
    const digitalSteps = useSignal<{ x: number; y: number }[]>([]);

    // Update signals when configuration changes
    useEffect(() => {
        const newAnalogSignal = generateAnalogSignal(200); // Higher resolution for smooth curve
        analogSignal.value = newAnalogSignal;

        // Sample the analog signal at the specified rate
        const samplePoints = Math.max(2, samplingCount.value);
        const sampledAnalogSignal = Array.from(
            { length: samplePoints },
            (_, i) => newAnalogSignal[Math.floor((i * (newAnalogSignal.length - 1)) / (samplePoints - 1))]
        );

        const newQuantizedPoints = quantizeSignal(sampledAnalogSignal, bitDepth.value);
        quantizedPoints.value = newQuantizedPoints;

        const newDigitalSteps = createDigitalSteps(newQuantizedPoints);
        digitalSteps.value = newDigitalSteps;
    }, [bitDepth.value, samplingCount.value, timeRange.value, voltageRange.value]);

    // Prepare SVG paths
    const analogPath = analogSignal.value.map((value, index) => {
        const x = (index / (analogSignal.value.length - 1)) * (GRAPH_WIDTH - 2 * PADDING) + PADDING;
        const y = GRAPH_HEIGHT - PADDING - ((value + voltageRange.value / 2) / voltageRange.value) * (GRAPH_HEIGHT - 2 * PADDING);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const digitalPath = digitalSteps.value.map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    const handleSamplingCountChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        samplingCount.value = parseInt(target.value, 10);
    };

    return (<>
        <Graphics>
            {/* Horizontal grid lines */}
            {Array.from({ length: 11 }, (_, i) => (
                <line
                    key={`horizontal-${i}`}
                    x1={PADDING}
                    y1={PADDING + (i * (GRAPH_HEIGHT - 2 * PADDING)) / 10}
                    x2={GRAPH_WIDTH - PADDING}
                    y2={PADDING + (i * (GRAPH_HEIGHT - 2 * PADDING)) / 10}
                    stroke={colors.surface0.hex}
                    strokeWidth={STROKE_WIDTH}
                />
            ))}
            {/* Vertical grid lines aligned with sampling points */}
            {Array.from({ length: samplingCount.value + 1 }, (_, i) => (
                <line
                    key={`vertical-${i}`}
                    x1={PADDING + (i * (GRAPH_WIDTH - 2 * PADDING)) / samplingCount.value}
                    y1={PADDING}
                    x2={PADDING + (i * (GRAPH_WIDTH - 2 * PADDING)) / samplingCount.value}
                    y2={GRAPH_HEIGHT - PADDING}
                    stroke={colors.surface0.hex}
                    strokeWidth={STROKE_WIDTH}
                />
            ))}

            {/* Axes */}
            <line
                x1={PADDING}
                y1={GRAPH_HEIGHT / 2}
                x2={GRAPH_WIDTH - PADDING}
                y2={GRAPH_HEIGHT / 2}
                stroke={colors.surface2.hex}
                stroke-width={STROKE_WIDTH}
            />
            <line
                x1={PADDING}
                y1={PADDING}
                x2={PADDING}
                y2={GRAPH_HEIGHT - PADDING}
                stroke={colors.surface2.hex}
                stroke-width={STROKE_WIDTH}
            />

            {/* Voltage labels */}
            <text x={PADDING - 30} y={PADDING} textAnchor="middle">2V</text>
            <text x={PADDING - 30} y={GRAPH_HEIGHT / 2} textAnchor="middle">0V</text>
            <text x={PADDING - 30} y={GRAPH_HEIGHT - PADDING} textAnchor="middle">-2V</text>

            {/* Time label */}
            <text x={GRAPH_WIDTH - PADDING} y={GRAPH_HEIGHT / 2 + 20} textAnchor="end">t(ms)</text>
            <text x={GRAPH_WIDTH / 2} y={GRAPH_HEIGHT - PADDING + 30} textAnchor="middle">{timeRange.value} ms</text>

            {/* Analog signal path */}
            <path d={analogPath} fill="none" stroke={colors.yellow.hex} stroke-width="3" />

            {/* Digital quantized signal path */}
            <path d={digitalPath} fill="none" stroke={colors.green.hex} stroke-width="2" />

            {/* Sample points and binary values */}
            {quantizedPoints.value.map((point, index) => (
                <g key={`sample-${index}`}>
                    <circle cx={point.x} cy={point.y} r="3" fill={colors.sky.hex} />
                    <text x={point.x} y={GRAPH_HEIGHT - PADDING + 15} textAnchor="middle" fontSize="10">
                        {index === 0 ? "1er" : index === quantizedPoints.value.length - 1 ? "dernier" : ""}
                    </text>

                </g>
            ))}
        </Graphics>
        <SettingsPopup>
            <form>
                <FormField>
                    <label for="samplingCount">Sampling Count: {samplingCount.value}</label>
                    <input
                        type="range"
                        id="samplingCount"
                        min="0"
                        max="128"
                        value={samplingCount.value}
                        onInput={handleSamplingCountChange}
                    />
                </FormField>
            </form>
        </SettingsPopup>
    </>)
}
