import { useSignal, useComputed } from '@preact/signals';

interface Point {
    x: number;
    y: number;
}

export const FourierSquareWave = () => {
    // Signal to store the number of harmonics
    const harmonicsCount = useSignal(5);
    const svgWidth = 800;
    const svgHeight = 400;
    const padding = 40;

    // Settings for drawing
    const plotWidth = svgWidth - 2 * padding;
    const plotHeight = svgHeight - 2 * padding;
    const centerY = svgHeight / 2;
    const amplitude = plotHeight / 3;
    const periods = 2;

    // Calculate points for each harmonic and the sum
    const harmonicPoints = useComputed(() => {
        const points: Record<string, Point[]> = { sum: [] };
        const pointsPerPeriod = 300;
        const totalPoints = periods * pointsPerPeriod;

        // Generate x coordinates
        const xCoords = Array.from({ length: totalPoints }, (_, i) => {
            return padding + (i / totalPoints) * plotWidth;
        });

        // Calculate each harmonic and the sum
        for (let i = 0; i < totalPoints; i++) {
            const x = xCoords[i];
            const t = (2 * Math.PI * periods * (i / totalPoints));

            let sumY = 0;

            // Generate points for each individual harmonic
            for (let n = 0; n < harmonicsCount.value; n++) {
                const harmonicN = 2 * n + 1; // Only odd harmonics for square wave
                const harmonicAmplitude = amplitude * (4 / (Math.PI * harmonicN));
                const y = harmonicAmplitude * Math.sin(harmonicN * t);

                if (!points[`h${n}`]) points[`h${n}`] = [];

                points[`h${n}`].push({
                    x,
                    y: centerY + y
                });

                sumY += y;
            }

            // Add sum point
            points.sum.push({
                x,
                y: centerY + sumY
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
    const squareWavePath = useComputed(() => {
        const pointsPerPeriod = 100;
        const totalPoints = periods * pointsPerPeriod;
        let pathData = '';

        for (let i = 0; i < totalPoints; i++) {
            const x = padding + (i / totalPoints) * plotWidth;
            const t = i / pointsPerPeriod;
            const y = centerY + (t % 1 < 0.5 ? -amplitude : amplitude);

            pathData += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;

            // Add vertical lines at transitions
            if (i > 0 && Math.floor(t) !== Math.floor((i - 1) / pointsPerPeriod)) {
                const prevX = padding + ((i - 1) / totalPoints) * plotWidth;
                const prevY = centerY + ((i - 1) / pointsPerPeriod % 1 < 0.5 ? -amplitude : amplitude);
                pathData += `L ${prevX} ${prevY} L ${prevX} ${y} L ${x} ${y} `;
            }
        }

        return pathData;
    });

    // Colors for the harmonics
    const colors = [
        '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
        '#a65628', '#f781bf', '#999999', '#66c2a5', '#fc8d62'
    ];

    return (
        <div class="fourier-container">
            <h2>Fourier Series Approximation of a Square Wave</h2>

            <div class="controls">
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
            </div>

            <svg width={svgWidth} height={svgHeight}>
                {/* X and Y axes */}
                <line
                    x1={padding}
                    y1={centerY}
                    x2={svgWidth - padding}
                    y2={centerY}
                    stroke="#ccc"
                    stroke-width="1"
                />
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={svgHeight - padding}
                    stroke="#ccc"
                    stroke-width="1"
                />

                {/* Perfect square wave (reference) */}
                <path
                    d={squareWavePath.value}
                    fill="none"
                    stroke="#ddd"
                    stroke-width="1"
                    stroke-dasharray="5,5"
                />

                {/* Individual harmonics */}
                {Array.from({ length: harmonicsCount.value }).map((_, i) => (
                    <path
                        key={`harmonic-${i}`}
                        d={pathStrings.value[`h${i}`]}
                        fill="none"
                        stroke={colors[i % colors.length]}
                        stroke-width="1.5"
                        opacity="0.6"
                    />
                ))}

                {/* Sum of harmonics (approximation) */}
                <path
                    d={pathStrings.value.sum}
                    fill="none"
                    stroke="#000"
                    stroke-width="2.5"
                />

                {/* Legend */}
                <text x={padding} y={padding - 10} fill="#000" font-size="14">Square Wave Approximation using Fourier Series</text>

                <g transform={`translate(${svgWidth - 200}, ${padding})`}>
                    <text y="0" fill="#000" font-size="12">Legend:</text>
                    <line x1="0" y1="20" x2="20" y2="20" stroke="#ddd" stroke-width="1" stroke-dasharray="5,5" />
                    <text x="25" y="24" fill="#000" font-size="12">Perfect Square Wave</text>

                    <line x1="0" y1="40" x2="20" y2="40" stroke="#000" stroke-width="2.5" />
                    <text x="25" y="44" fill="#000" font-size="12">Sum of Harmonics</text>

                    {Array.from({ length: Math.min(5, harmonicsCount.value) }).map((_, i) => (
                        <g key={`legend-${i}`} transform={`translate(0, ${60 + i * 20})`}>
                            <line
                                x1="0"
                                y1="0"
                                x2="20"
                                y2="0"
                                stroke={colors[i % colors.length]}
                                stroke-width="1.5"
                                opacity="0.6"
                            />
                            <text x="25" y="4" fill="#000" font-size="12">
                                Harmonic {2 * i + 1}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>

            <div class="description">
                <p>
                    A square wave can be approximated using a Fourier series consisting of sine waves
                    of odd-integer harmonics: f(t) = (4/π) × (sin(t) + sin(3t)/3 + sin(5t)/5 + ...)
                </p>
                <p>
                    Adjust the slider to see how adding more harmonics improves the approximation.
                </p>
            </div>

            <style>
                {`
          .fourier-container {
            font-family: system-ui, sans-serif;
            max-width: ${svgWidth}px;
            margin: 0 auto;
          }
          .controls {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          input[type="range"] {
            width: 100%;
          }
          .description {
            margin-top: 20px;
            font-size: 14px;
            color: #555;
          }
        `}
            </style>
        </div>
    );
};

