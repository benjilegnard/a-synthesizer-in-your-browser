import { useEffect, useRef, useState } from 'preact/hooks';
import { SettingsPopup } from '../components/settings-popup';
import { Graphics } from '../components/graphics';

interface EnvelopePoint {
    x: number;
    y: number;
}

export const EnvelopeGenerator = () => {
    // State for envelope parameters (in seconds)
    const [delayTime, setDelayTime] = useState<number>(0.1);
    const [attackTime, setAttackTime] = useState<number>(0.2);
    const [releaseTime, setReleaseTime] = useState<number>(0.5);
    const [sustainLevel, setSustainLevel] = useState<number>(0.8);
    const [sustainTime, setSustainTime] = useState<number>(0.3);

    // Web Audio API context and nodes using refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // SVG dimensions
    const width = 1280;
    const height = 720;
    const padding = 60;

    // Initialize Web Audio API
    useEffect(() => {
        // Create audio context only when needed (on first render)
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }

        return () => {
            // Cleanup
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
            }
            if (gainNodeRef.current) {
                gainNodeRef.current.disconnect();
            }
        };
    }, []);

    // Calculate envelope points for SVG path
    const calculateEnvelopePoints = (): EnvelopePoint[] => {
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);

        // Calculate time scaling factor - fixed maximum time for better visualization
        const maxTimeScale = 3; // 3 seconds as max display width
        const timeScaleFactor = graphWidth / maxTimeScale;

        // Calculate x positions based on absolute times, not relative proportions
        const startX = padding;
        const delayX = startX + (delayTime * timeScaleFactor);
        const attackX = delayX + (attackTime * timeScaleFactor);
        const sustainX = attackX + (sustainTime * timeScaleFactor);
        const endX = sustainX + (releaseTime * timeScaleFactor);

        // Calculate y positions (inverted because SVG y increases downward)
        const zeroY = height - padding;
        const sustainY = zeroY - (sustainLevel * (height - (padding * 2)));

        // Return points for the envelope path
        return [
            { x: startX, y: zeroY }, // Start at 0
            { x: delayX, y: zeroY }, // Delay period (no amplitude change)
            { x: attackX, y: sustainY }, // Attack ramp up to sustain level
            { x: sustainX, y: sustainY }, // Sustain period
            { x: endX, y: zeroY } // Release ramp down to 0
        ];
    };

    // Generate SVG path from points
    const generatePath = (points: EnvelopePoint[]): string => {
        return points.map((point, i) =>
            (i === 0 ? 'M' : 'L') + point.x + ',' + point.y
        ).join(' ');
    };

    // Play sound with envelope applied
    const playSound = (): void => {
        if (!audioContextRef.current) {
            return;
        }

        // Stop any previous sound
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
        }

        // Create new audio nodes
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Configure oscillator
        osc.type = 'sine';
        osc.frequency.value = 440; // A4 note

        // Connect nodes
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Store references
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;

        // Get current time
        const now = ctx.currentTime;

        // Set initial gain to 0
        gain.gain.setValueAtTime(0, now);

        // Apply envelope
        gain.gain.setValueAtTime(0, now + delayTime); // Start of attack
        gain.gain.linearRampToValueAtTime(sustainLevel, now + delayTime + attackTime); // Attack ramp
        gain.gain.setValueAtTime(sustainLevel, now + delayTime + attackTime + sustainTime); // End of sustain
        gain.gain.linearRampToValueAtTime(0, now + delayTime + attackTime + sustainTime + releaseTime); // Release ramp

        // Start oscillator
        osc.start(now);
        osc.stop(now + delayTime + attackTime + sustainTime + releaseTime + 0.1);
    };

    // Calculate points for the envelope visualization
    const envelopePoints = calculateEnvelopePoints();
    const pathData = generatePath(envelopePoints);

    return (
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>

            {/* SVG Envelope Visualization */}
            <Graphics>
                {/* Envelope path */}
                <path
                    d={pathData}
                    style={{ fill: 'none', stroke: '#3b82f6', strokeWidth: '5' }}
                />

                {/* Axis */}
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    style={{ stroke: '#000', strokeWidth: '2' }}
                />
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={height - padding}
                    style={{ stroke: '#000', strokeWidth: '2' }}
                />

                {/* Labels */}
                <text
                    x={width / 2}
                    y={height - 10}
                    style={{ textAnchor: 'middle', fontSize: '18px' }}
                >
                    Time
                </text>
                <text
                    x={15}
                    y={height / 2}
                    style={{ textAnchor: 'middle', fontSize: '18px' }}
                    transform={`rotate(-90, 15, ${height / 2})`}
                >
                    Amplitude
                </text>

                {/* Phase labels */}
                <text
                    x={padding + (envelopePoints[1].x - padding) / 2}
                    y={height - padding + 30}
                    style={{ textAnchor: 'middle', fontSize: '16px' }}
                >
                    Delay
                </text>
                <text
                    x={padding + (envelopePoints[2].x - envelopePoints[1].x) / 2 + (envelopePoints[1].x - padding)}
                    y={height - padding + 30}
                    style={{ textAnchor: 'middle', fontSize: '16px' }}
                >
                    Attack
                </text>
                <text
                    x={padding + (envelopePoints[3].x - envelopePoints[2].x) / 2 + (envelopePoints[2].x - padding)}
                    y={height - padding + 30}
                    style={{ textAnchor: 'middle', fontSize: '16px' }}
                >
                    Sustain
                </text>
                <text
                    x={padding + (envelopePoints[4].x - envelopePoints[3].x) / 2 + (envelopePoints[3].x - padding)}
                    y={height - padding + 30}
                    style={{ textAnchor: 'middle', fontSize: '16px' }}
                >
                    Release
                </text>
            </Graphics>

            {/* Controls */}
            <SettingsPopup>
                <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                Delay: {delayTime.toFixed(2)}s
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.01"
                                value={delayTime}
                                onInput={(e) => setDelayTime(parseFloat((e.target as HTMLInputElement).value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                Attack: {attackTime.toFixed(2)}s
                            </label>
                            <input
                                type="range"
                                min="0.01"
                                max="2"
                                step="0.01"
                                value={attackTime}
                                onInput={(e) => setAttackTime(parseFloat((e.target as HTMLInputElement).value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                Sustain Time: {sustainTime.toFixed(2)}s
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.01"
                                value={sustainTime}
                                onInput={(e) => setSustainTime(parseFloat((e.target as HTMLInputElement).value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                Sustain Level: {sustainLevel.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={sustainLevel}
                                onInput={(e) => setSustainLevel(parseFloat((e.target as HTMLInputElement).value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                Release: {releaseTime.toFixed(2)}s
                            </label>
                            <input
                                type="range"
                                min="0.01"
                                max="2"
                                step="0.01"
                                value={releaseTime}
                                onInput={(e) => setReleaseTime(parseFloat((e.target as HTMLInputElement).value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </form>
                {/* Play button */}
                <button
                    onClick={playSound}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        fontWeight: '500',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Play Sound
                </button>
            </SettingsPopup>
        </div>
    );
};

