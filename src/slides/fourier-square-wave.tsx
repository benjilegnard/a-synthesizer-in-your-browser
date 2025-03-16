import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';
import { flavors } from "@catppuccin/palette";

import { WIDTH, HEIGHT, STROKE_WIDTH } from "../common/constants";
import { Graphics } from '../components/graphics';
import { SettingsPopup } from '../components/settings-popup';
import { FormField } from '../components/form-field';

const { colors } = flavors.mocha;

const PADDING = 40;
const PLOT_WIDTH = WIDTH - 2 * PADDING;
const PLOT_HEIGHT = HEIGHT - 2 * PADDING;
const CENTER_Y = HEIGHT / 2;
const AMPLITUDE = PLOT_HEIGHT / 3;
const PERIODS = 2;

interface Point {
    x: number;
    y: number;
}

export const FourierSquareWave: FunctionalComponent = () => {
    // Signal to store the number of harmonics
    const harmonicsCount = useSignal(0);

    // Calculate points for each harmonic and the sum
    const harmonicPoints = useComputed(() => {
        const points: Record<string, Point[]> = { sum: [] };
        const pointsPerPeriod = 300;
        const totalPoints = PERIODS * pointsPerPeriod;

        // Generate x coordinates
        const xCoords = Array.from({ length: totalPoints }, (_, i) => {
            return PADDING + (i / totalPoints) * PLOT_WIDTH;
        });

        // Calculate each harmonic and the sum
        for (let i = 0; i < totalPoints; i++) {
            const x = xCoords[i];
            const t = (2 * Math.PI * PERIODS * (i / totalPoints));

            let sumY = 0;

            // Generate points for each individual harmonic
            for (let n = 0; n < harmonicsCount.value; n++) {
                const harmonicN = 2 * n + 1; // Only odd harmonics for square wave
                const harmonicAmplitude = AMPLITUDE * (4 / (Math.PI * harmonicN));
                const y = harmonicAmplitude * Math.sin(harmonicN * t);

                if (!points[`h${n}`]) points[`h${n}`] = [];

                points[`h${n}`].push({
                    x,
                    y: CENTER_Y + y
                });

                sumY += y;
            }

            // Add sum point
            points.sum.push({
                x,
                y: CENTER_Y + sumY
            });
        }

        return points;
    });

    // Generate SVG path strings
    const pathStrings = useComputed(() => {
        const paths: Record<string, string> = {};

        Object.entries(harmonicPoints.value).forEach(([key, points]) => {
            paths[key] = points.map((point, i) =>
                `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            ).join(' ');
        });

        return paths;
    });

    // Generate a perfect square wave for reference
    // Fixed: Using useMemo instead of useComputed since it doesn't depend on signals
    // Fixed: Starting the square wave at the bottom (-amplitude)
    const squareWavePath = useMemo(() => {
        const pointsPerPeriod = 100;
        const totalPoints = PERIODS * pointsPerPeriod;
        let pathData = '';

        for (let i = 0; i < totalPoints; i++) {
            const x = PADDING + (i / totalPoints) * PLOT_WIDTH;
            const t = i / pointsPerPeriod;
            // Start with negative amplitude (bottom position for first half-period)
            const y = CENTER_Y + (t % 1 < 0.5 ? AMPLITUDE : -AMPLITUDE);

            pathData += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;

            // Add vertical lines at transitions
            if (i > 0 && Math.floor(t) !== Math.floor((i - 1) / pointsPerPeriod)) {
                const prevX = PADDING + ((i - 1) / totalPoints) * PLOT_WIDTH;
                const prevY = CENTER_Y + ((i - 1) / pointsPerPeriod % 1 < 0.5 ? -AMPLITUDE : AMPLITUDE);
                pathData += `L ${prevX} ${prevY} L ${prevX} ${y} L ${x} ${y} `;
            }
        }

        return pathData;
    }, []); // Empty dependency array since this doesn't depend on any changing values

    // Colors from catppuccin palette
    const harmonicColors = [
        colors.red.hex,
        colors.blue.hex,
        colors.green.hex,
        // colors.yellow.hex,
        colors.mauve.hex,
        colors.peach.hex,
        colors.pink.hex,
        colors.teal.hex,
        colors.lavender.hex,
        colors.sky.hex,
        colors.sapphire.hex,
        colors.flamingo.hex,
        colors.rosewater.hex,
    ];

    return (
        <><SettingsPopup>
            <FormField>
                <label for="harmonics-slider">Number of Harmonics: {harmonicsCount.value}</label>
                <input
                    id="harmonics-slider"
                    type="range"
                    min="1"
                    max="20"
                    value={harmonicsCount.value}
                    onInput={(e) => {
                        harmonicsCount.value = parseInt((e.target as HTMLInputElement).value);
                    }}
                />
            </FormField></SettingsPopup>
            <Graphics>
                {/* X and Y axes */}
                <line
                    x1={PADDING}
                    y1={CENTER_Y}
                    x2={WIDTH - PADDING}
                    y2={CENTER_Y}
                    stroke="#ccc"
                    stroke-width="1"
                />
                <line
                    x1={PADDING}
                    y1={PADDING}
                    x2={PADDING}
                    y2={HEIGHT - PADDING}
                    stroke="#ccc"
                    stroke-width="1"
                />

                {/* Perfect square wave (reference) */}
                <path
                    d={squareWavePath}
                    fill="none"
                    stroke={colors.text.hex}
                    stroke-width={STROKE_WIDTH}
                    stroke-dasharray="5,5"
                />

                {/* Individual harmonics */}
                {Array.from({ length: harmonicsCount.value }).map((_, i) => (
                    <path
                        key={`harmonic-${i}`}
                        d={pathStrings.value[`h${i}`]}
                        fill="none"
                        stroke={harmonicColors[i % harmonicColors.length]}
                        stroke-width="1.5"
                        opacity="0.6"
                    />
                ))}

                {/* Sum of harmonics (approximation) */}
                <path
                    d={pathStrings.value.sum}
                    fill="none"
                    stroke={colors.yellow.hex}
                    stroke-width={STROKE_WIDTH}
                />

                {/* Legend */}
                <g transform={`translate(${WIDTH - 200}, ${PADDING})`}>
                    <text y="0" fill={colors.text.hex} font-size="12">Legend:</text>
                    <line x1="0" y1="20" x2="20" y2="20" stroke={colors.yellow.hex} stroke-width={STROKE_WIDTH} stroke-dasharray="5,5" />
                    <text x="25" y="24" fill={colors.text.hex} font-size="12">Onde carrée idéale</text>

                    <line x1="0" y1="40" x2="20" y2="40" stroke="#000" stroke-width="2.5" />
                    <text x="25" y="44" fill={colors.text.hex} font-size="12">Somme des Harmoniques</text>

                    {Array.from({ length: Math.min(5, harmonicsCount.value) }).map((_, i) => (
                        <g key={`legend-${i}`} transform={`translate(0, ${60 + i * 20})`}>
                            <line
                                x1="0"
                                y1="0"
                                x2="20"
                                y2="0"
                                stroke={harmonicColors[i % harmonicColors.length]}
                                stroke-width="1.5"
                                opacity="0.6"
                            />
                            <text x="25" y="4" fill={colors.text.hex} font-size="12">
                                Harmonique {2 * i + 1}
                            </text>
                        </g>
                    ))}
                </g>
            </Graphics>
        </>
    );
};

