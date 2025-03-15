import { useSignal, useComputed } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Graphics } from '../components/graphics';
import { flavors } from "@catppuccin/palette";
import { FunctionalComponent } from 'preact';
interface Point {
    x: number;
    y: number;
}
const mocha = flavors.mocha.colors;
const sinColor = mocha.green.hex;
const cosColor = mocha.blue.hex;
const angleColor = mocha.yellow.hex;
const legendColor = mocha.surface0.hex;
// Constants
const WIDTH = 1280;
const PADDING = 20;
const CIRCLE_RADIUS = 318;
const CENTER_X = 360;
const CENTER_Y = 360;
const SINE_CURVE_WIDTH = WIDTH - PADDING * 4 - CIRCLE_RADIUS * 2;
const SINE_CURVE_HEIGHT = CIRCLE_RADIUS;
const SINE_CURVE_X = CENTER_X + CIRCLE_RADIUS + PADDING * 2;
const SINE_CURVE_Y = CENTER_Y;
const FONT_SIZE = "24px";
const LABEL_OFFSET = 8;
// the more the slower
const SPEED_FACTOR = 1000;

export const TrigonometricCircle: FunctionalComponent = () => {

    // Store the timestamp in a signal
    const timestamp = useSignal(0);

    // Compute the angle in radians based on timestamp
    const angle = useComputed(() => {
        return (timestamp.value / SPEED_FACTOR) % (2 * Math.PI);
    });

    // Compute sine and cosine values
    const sinValue = useComputed(() => Math.sin(angle.value));
    const cosValue = useComputed(() => Math.cos(angle.value));

    // Compute the point on the circle
    const point = useComputed<Point>(() => ({
        x: CENTER_X + CIRCLE_RADIUS * cosValue.value,
        y: CENTER_Y - CIRCLE_RADIUS * sinValue.value
    }));

    // Animation frame effect
    useEffect(() => {
        let animationId: number;

        const animate = (time: number) => {
            timestamp.value = time;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    // Generate points for the sine curve
    const sinePoints = useComputed(() => {
        const points: Point[] = [];

        for (let i = 0; i < SINE_CURVE_WIDTH; i++) {
            const x = SINE_CURVE_X + i;
            const curveAngle = angle.value - (i / SINE_CURVE_WIDTH) * 4 * Math.PI;
            const y = SINE_CURVE_Y - SINE_CURVE_HEIGHT * Math.sin(curveAngle);
            points.push({ x, y });
        }

        return points;
    });

    // Helper function to format angle
    const formatAngle = (rad: number) => {
        const normalized = rad % (2 * Math.PI);

        if (Math.abs(normalized - 0) < 0.01 || Math.abs(normalized - 2 * Math.PI) < 0.01) {
            return '0';
        } else if (Math.abs(normalized - Math.PI / 2) < 0.01) {
            return 'π/2';
        } else if (Math.abs(normalized - Math.PI) < 0.01) {
            return 'π';
        } else if (Math.abs(normalized - 3 * Math.PI / 2) < 0.01) {
            return '3π/2';
        } else {
            return normalized.toFixed(2);
        }
    };

    return (

        <Graphics>

            {/* Circle */}
            <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={CIRCLE_RADIUS}
                style={{
                    stroke: legendColor,
                    strokeWidth: "3",
                    fill: "none"
                }}
            />

            {/* X and Y axes */}
            <line
                x1={CENTER_X - CIRCLE_RADIUS - 20}
                y1={CENTER_Y}
                x2={CENTER_X + CIRCLE_RADIUS + 20}
                y2={CENTER_Y}
                style={{
                    stroke: legendColor,
                    strokeWidth: "3",
                }}
            />
            <line
                x1={CENTER_X}
                y1={CENTER_Y - CIRCLE_RADIUS - 20}
                x2={CENTER_X}
                y2={CENTER_Y + CIRCLE_RADIUS + 20}
                style={{
                    stroke: legendColor,
                    strokeWidth: "3",
                }}
            />

            {/* Labels for 0, π/2, π, 3π/2 */}
            <text x={CENTER_X + CIRCLE_RADIUS + LABEL_OFFSET} y={CENTER_Y + LABEL_OFFSET} style={{ fontSize: FONT_SIZE, fill: mocha.text.hex }}>0</text>
            <text x={CENTER_X - LABEL_OFFSET} y={CENTER_Y - CIRCLE_RADIUS - LABEL_OFFSET} style={{ fontSize: FONT_SIZE, fill: mocha.text.hex }}>π/2</text>
            <text x={CENTER_X - CIRCLE_RADIUS - LABEL_OFFSET * 4} y={CENTER_Y + LABEL_OFFSET} style={{ fontSize: FONT_SIZE, fill: mocha.text.hex }}>π</text>
            <text x={CENTER_X - LABEL_OFFSET} y={CENTER_Y + CIRCLE_RADIUS + LABEL_OFFSET * 3} style={{ fontSize: FONT_SIZE, fill: mocha.text.hex }}>3π/2</text>

            {/* Current point on circle */}
            <circle
                cx={point.value.x}
                cy={point.value.y}
                r="5"
                style={{ fill: angleColor }}
            />

            {/* Line from center to current point */}
            <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={point.value.x}
                y2={point.value.y}
                style={{
                    stroke: angleColor,
                    strokeWidth: "3"
                }}
            />

            {/* Projection on X-axis (cosine) */}
            <line
                x1={point.value.x}
                y1={point.value.y}
                x2={point.value.x}
                y2={CENTER_Y}
                style={{
                    stroke: cosColor,
                    strokeDasharray: "4",
                    strokeWidth: "3"
                }}
            />
            <circle
                cx={point.value.x}
                cy={CENTER_Y}
                r="3"
                style={{ fill: cosColor }}
            />

            {/* Projection on Y-axis (sine) */}
            <line
                x1={point.value.x}
                y1={point.value.y}
                x2={CENTER_X}
                y2={point.value.y}
                style={{
                    stroke: sinColor,
                    strokeDasharray: "4",
                    strokeWidth: "3"
                }}
            />
            <circle
                cx={CENTER_X}
                cy={point.value.y}
                r="3"
                style={{
                    fill: sinColor,
                }}
            />

            {/* Sine wave axis */}
            <line
                x1={SINE_CURVE_X}
                y1={SINE_CURVE_Y}
                x2={SINE_CURVE_X + SINE_CURVE_WIDTH}
                y2={SINE_CURVE_Y}
                style={{ stroke: legendColor, strokeWidth: "3" }}
            />

            {/* Sine wave */}
            <path
                d={`M ${SINE_CURVE_X} ${SINE_CURVE_Y} ${sinePoints.value
                    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
                    .join(' ')}`}
                style={{ strokeWidth: "3", fill: "none", stroke: sinColor }}
            />

            <g id="trigonometric-circle-legend">
                {/* Value indicators */}
                <text x="24" y="30" style={{ fill: angleColor, fontSize: FONT_SIZE }}>
                    Angle: {formatAngle(angle.value)} rad
                </text>
                <text x="20" y="60" style={{ fontWeight: 'bold', fill: cosColor, fontSize: FONT_SIZE }}>
                    cos(θ): {cosValue.value.toFixed(3)}
                </text>
                <text x="20" y="90" style={{ fontWeight: 'bold', fill: sinColor, fontSize: FONT_SIZE }}>
                    sin(θ): {sinValue.value.toFixed(3)}
                </text>
            </g>
        </Graphics >
    );
}
