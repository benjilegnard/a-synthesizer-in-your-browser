import { useEffect, useRef, useState } from 'preact/hooks';
import { SettingsPopup } from '../components/settings-popup';
import { Graphics } from '../components/graphics';
import { FunctionalComponent } from 'preact';
import { HEIGHT, WIDTH, STROKE_WIDTH, catppuccin } from '../common/constants';
import { FormField } from '../components/form-field';

interface Point {
    x: number;
    y: number;
}
const MAX_DISPLAY_DURATION = 3; // seconds
const PADDING = 40;
interface EnvelopeGeneratorProps {
    decayEnabled?: boolean;
    delayEnabled?: boolean;
}

export const EnvelopeGenerator: FunctionalComponent<EnvelopeGeneratorProps> = ({ decayEnabled, delayEnabled }) => {
    // State for envelope parameters (in seconds)
    const [delayTime, setDelayTime] = useState<number>(delayEnabled ? .1 : 0);
    const [attackTime, setAttackTime] = useState<number>(0.2);
    const [decayTime, setDecayTime] = useState<number>(decayEnabled ? 0.15 : 0);
    const [releaseTime, setReleaseTime] = useState<number>(0.5);
    const [sustainLevel, setSustainLevel] = useState<number>(decayEnabled ? 0.8 : 1.0); // Lower default to show decay effect
    const [sustainTime, setSustainTime] = useState<number>(0.3);

    // Web Audio API context and nodes using refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

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
    const calculateEnvelopePoints = (): Point[] => {
        const graphWidth = WIDTH - (PADDING * 2);
        // const graphHeight = HEIGHT - (PADDING * 2);

        // Calculate time scaling factor - fixed maximum time for better visualization
        const timeScaleFactor = graphWidth / MAX_DISPLAY_DURATION;

        // Calculate x positions based on absolute times, not relative proportions
        const startX = PADDING;
        const delayX = startX + (delayTime * timeScaleFactor);
        const attackX = delayX + (attackTime * timeScaleFactor);
        const decayX = attackX + (decayTime * timeScaleFactor);
        const sustainX = decayX + (sustainTime * timeScaleFactor);
        const endX = sustainX + (releaseTime * timeScaleFactor);

        // Calculate y positions (inverted because SVG y increases downward)
        const zeroY = HEIGHT - PADDING;

        const peakY = zeroY - (1.0 * (HEIGHT - (PADDING * 2))); // Attack peak (always 1.0)
        const sustainY = zeroY - (sustainLevel * (HEIGHT - (PADDING * 2)));

        // Return points for the envelope path
        return [
            { x: startX, y: zeroY }, // Start at 0
            { x: delayX, y: zeroY }, // Delay period (no amplitude change)
            { x: attackX, y: peakY }, // Attack ramp up to peak (1.0)
            { x: decayX, y: sustainY }, // Decay ramp down to sustain level
            { x: sustainX, y: sustainY }, // Sustain period
            { x: endX, y: zeroY } // Release ramp down to 0
        ];
    };


    // Calculate trigger points for secondary graph
    const calculateTriggerPoints = (envelopePoints: Point[]): Point[] => {
        const graphHeight = HEIGHT - (PADDING * 2);
        const triggerY = HEIGHT - PADDING - (0.2 * graphHeight); // Position at 20% of graph height
        const offTriggerY = HEIGHT - PADDING - (0.05 * graphHeight); // Position at 5% of graph height

        // Align with delay end (note trigger) and sustain end (note off)
        const noteOnX = envelopePoints[1].x; // End of delay
        const noteOffX = envelopePoints[4].x; // End of sustain

        return [
            { x: PADDING, y: offTriggerY }, // Start at off position
            { x: noteOnX, y: offTriggerY }, // Right before trigger
            { x: noteOnX, y: triggerY }, // Trigger on
            { x: noteOffX, y: triggerY }, // Hold trigger
            { x: noteOffX, y: offTriggerY }, // Trigger off
            { x: envelopePoints[5].x, y: offTriggerY } // End at off position (aligned with release end)
        ];
    };

    // Generate SVG path from points
    const generatePath = (points: Point[]): string => {
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
        gain.gain.linearRampToValueAtTime(1.0, now + delayTime + attackTime); // Attack ramp to peak
        gain.gain.linearRampToValueAtTime(sustainLevel, now + delayTime + attackTime + decayTime); // Decay ramp to sustain level
        gain.gain.setValueAtTime(sustainLevel, now + delayTime + attackTime + decayTime + sustainTime); // End of sustain
        gain.gain.linearRampToValueAtTime(0, now + delayTime + attackTime + decayTime + sustainTime + releaseTime); // Release ramp

        // Start oscillator
        osc.start(now);
        osc.stop(now + delayTime + attackTime + decayTime + sustainTime + releaseTime + 0.1);
    };


    // Calculate points for the envelope visualization
    const envelopePoints = calculateEnvelopePoints();
    const envelopePath = generatePath(envelopePoints);

    // Calculate points for the trigger visualization
    const triggerPoints = calculateTriggerPoints(envelopePoints);
    const triggerPath = generatePath(triggerPoints);
    return (
        <>
            {/* SVG Envelope Visualization */}
            <Graphics>

                {/* Envelope path */}
                <path
                    d={envelopePath}
                    style={{ fill: 'none', stroke: catppuccin.sky, strokeWidth: STROKE_WIDTH }}
                />

                {/* Trigger path */}
                <path
                    d={triggerPath}
                    style={{ fill: 'none', stroke: catppuccin.yellow, strokeWidth: STROKE_WIDTH, strokeDasharray: '5,5' }}
                />

                {/* Trigger labels */}
                <text
                    x={triggerPoints[2].x + 10}
                    y={triggerPoints[2].y - 10}
                    style={{ fontSize: '14px', fill: catppuccin.yellow }}
                >
                    Note On
                </text>
                <text
                    x={triggerPoints[4].x + 10}
                    y={triggerPoints[4].y - 10}
                    style={{ fontSize: '14px', fill: catppuccin.yellow }}
                >
                    Note Off
                </text>

                {/* Axis */}
                <line
                    x1={PADDING}
                    y1={HEIGHT - PADDING}
                    x2={WIDTH - PADDING}
                    y2={HEIGHT - PADDING}
                    style={{ stroke: catppuccin.surface, strokeWidth: STROKE_WIDTH }}
                />
                <line
                    x1={PADDING}
                    y1={PADDING}
                    x2={PADDING}
                    y2={HEIGHT - PADDING}
                    style={{ stroke: catppuccin.surface, strokeWidth: STROKE_WIDTH }}
                />

                {/* Labels */}
                <text
                    x={WIDTH / 2}
                    y={HEIGHT - 10}
                    style={{ fill: catppuccin.text, textAnchor: 'middle', fontSize: '18px', fontFamily: "Poppins" }}
                >
                    Time
                </text>
                <text
                    x={15}
                    y={HEIGHT / 2}
                    style={{ fill: catppuccin.text, textAnchor: 'middle', fontSize: '18px', fontFamily: "Poppins" }}
                    transform={`rotate(-90, 15, ${HEIGHT / 2})`}
                >
                    Amplitude
                </text>

                {/* Phase labels */}
                <text
                    x={PADDING + (envelopePoints[1].x - PADDING) / 2}
                    y={HEIGHT - PADDING + 30}
                    style={{ fill: catppuccin.overlay, textAnchor: 'middle', fontSize: '16px' }}
                >
                    Delay
                </text>
                <text
                    x={PADDING + (envelopePoints[2].x - envelopePoints[1].x) / 2 + (envelopePoints[1].x - PADDING)}
                    y={HEIGHT - PADDING + 30}
                    style={{ fill: catppuccin.overlay, textAnchor: 'middle', fontSize: '16px' }}
                >
                    Attack
                </text>
                <text
                    x={PADDING + (envelopePoints[3].x - envelopePoints[2].x) / 2 + (envelopePoints[2].x - PADDING)}
                    y={HEIGHT - PADDING + 30}
                    style={{ fill: catppuccin.overlay, textAnchor: 'middle', fontSize: '16px' }}
                >
                    Decay
                </text>
                <text
                    x={PADDING + (envelopePoints[4].x - envelopePoints[3].x) / 2 + (envelopePoints[3].x - PADDING)}
                    y={HEIGHT - PADDING + 30}
                    style={{ fill: catppuccin.overlay, textAnchor: 'middle', fontSize: '16px' }}
                >
                    Sustain
                </text>
                <text
                    x={PADDING + (envelopePoints[5].x - envelopePoints[4].x) / 2 + (envelopePoints[4].x - PADDING)}
                    y={HEIGHT - PADDING + 30}
                    style={{ fill: catppuccin.overlay, textAnchor: 'middle', fontSize: '16px' }}
                >
                    Release
                </text>
            </Graphics>

            {/* Controls */}
            <SettingsPopup>
                <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {delayEnabled &&
                            <FormField>
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
                            </FormField>
                        }
                        <FormField>
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
                        </FormField>
                        {decayEnabled &&
                            <FormField>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                    Decay: {decayTime.toFixed(2)}s
                                </label>
                                <input
                                    type="range"
                                    min="0.01"
                                    max="2"
                                    step="0.01"
                                    value={decayTime}
                                    onInput={(e) => setDecayTime(parseFloat((e.target as HTMLInputElement).value))}
                                    style={{ width: '100%' }}
                                />
                            </FormField>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <FormField>
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
                        </FormField>
                        {decayEnabled &&
                            <FormField>
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
                            </FormField>
                        }
                        <FormField>
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
                        </FormField>
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
                    }}
                >
                    Play Sound
                </button>
            </SettingsPopup>
        </>
    );
};

export const OscillatorOneEnvelopeGenerator: FunctionalComponent = () => <EnvelopeGenerator decayEnabled={false} delayEnabled={true} />;

export const OscillatorTwoEnvelopeGenerator: FunctionalComponent = () => <EnvelopeGenerator decayEnabled={true} delayEnabled={false} />;
