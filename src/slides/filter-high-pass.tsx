import { Graphics } from "../components/graphics";
import { SettingsPopup } from "../components/settings-popup";
import { FunctionalComponent } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { HEIGHT, WIDTH } from "../common/constants";

// Constants
const PADDING = 20;
const SVG_WIDTH = WIDTH;
const SVG_HEIGHT = HEIGHT;
const MARGIN = { top: 20, right: 20, bottom: 30, left: 40 };
const GRAPH_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const GRAPH_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
const MIN_FREQ = 20;
const MAX_FREQ = 20000;
const POINT_COUNT = 200;
const LOG_BASE = Math.pow(MAX_FREQ / MIN_FREQ, 1 / (POINT_COUNT - 1));

// Catppuccin Mocha palette
const colors = {
    base: '#1e1e2e',
    mantle: '#181825',
    crust: '#11111b',
    text: '#cdd6f4',
    subtext1: '#bac2de',
    subtext0: '#a6adc8',
    overlay2: '#9399b2',
    overlay1: '#7f849c',
    overlay0: '#6c7086',
    surface2: '#585b70',
    surface1: '#45475a',
    surface0: '#313244',
    red: '#f38ba8',
    maroon: '#eba0ac',
    peach: '#fab387',
    yellow: '#f9e2af',
    green: '#a6e3a1',
    teal: '#94e2d5',
    sky: '#89dceb',
    sapphire: '#74c7ec',
    blue: '#89b4fa',
    lavender: '#b4befe',
    mauve: '#cba6f7',
    pink: '#f5c2e7',
    flamingo: '#f2cdcd',
    rosewater: '#f5e0dc'
};

// Types
interface FilterFormProps {
    type: 'highpass' | 'lowpass';
    cutoffFreq: number;
    qFactor: number;
    onCutoffChange: (value: number) => void;
    onQChange: (value: number) => void;
}

// Utility functions
const logFreqToX = (freq: number): number => {
    const logMin = Math.log10(MIN_FREQ);
    const logMax = Math.log10(MAX_FREQ);
    const logFreq = Math.log10(Math.max(freq, MIN_FREQ));

    return ((logFreq - logMin) / (logMax - logMin)) * GRAPH_WIDTH;
};

const responseToY = (response: number): number => {
    return GRAPH_HEIGHT - (response * GRAPH_HEIGHT * 0.8);
};

const generateFrequencyTicks = () => {
    const freqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    return freqs.map(freq => ({
        x: logFreqToX(freq),
        label: freq >= 1000 ? `${freq / 1000}k` : `${freq}`
    }));
};

const calcHighpassResponse = (freq: number, cutoff: number, q: number) => {
    const w = freq / cutoff;
    if (w === 0) return 0;

    const resonancePeak = q > 0.707 ? Math.pow(q / 0.707, 2) : 1;
    const response = Math.pow(w, 2) / (1 + (1 / q) * w + Math.pow(w, 2));

    // Add resonance peak near cutoff
    if (freq > cutoff * 0.8 && freq < cutoff * 1.5) {
        const peakFactor = Math.exp(-Math.pow(Math.log(freq / cutoff), 2) * 4);
        return response + (resonancePeak - 1) * peakFactor * response;
    }

    return response;
};

const calcLowpassResponse = (freq: number, cutoff: number, q: number) => {
    const w = freq / cutoff;
    if (w === 0) return 1;

    const resonancePeak = q > 0.707 ? Math.pow(q / 0.707, 2) : 1;
    const response = 1 / (1 + (1 / q) * w + Math.pow(w, 2));

    // Add resonance peak near cutoff
    if (freq > cutoff * 0.7 && freq < cutoff * 1.2) {
        const peakFactor = Math.exp(-Math.pow(Math.log(freq / cutoff), 2) * 4);
        return response + (resonancePeak - 1) * peakFactor * response;
    }

    return response;
};

const generateFilterPoints = (cutoffFreq: number, qFactor: number, type: 'highpass' | 'lowpass') => {
    const points = [];

    for (let i = 0; i < POINT_COUNT; i++) {
        const freq = MIN_FREQ * Math.pow(LOG_BASE, i);
        const xPos = logFreqToX(freq);

        // Calculate filter response based on type
        const response = type === 'highpass'
            ? calcHighpassResponse(freq, cutoffFreq, qFactor)
            : calcLowpassResponse(freq, cutoffFreq, qFactor);

        points.push({ x: xPos, y: responseToY(response) });
    }

    return points;
};

// FilterForm Component
const FilterForm = ({ type, cutoffFreq, qFactor, onCutoffChange, onQChange }: FilterFormProps) => {
    const frequencyRangeProps = type === 'highpass'
        ? { min: 20, max: 1000, step: 1 }
        : { min: 1000, max: 20000, step: 10 };

    const styles = {
        container: {
            margin: '8px 0'
        },
        formGroup: {
            marginBottom: '8px'
        },
        label: {
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            color: colors.text
        },
        input: {
            width: '100%',
            accentColor: type === 'highpass' ? colors.blue : colors.red
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formGroup}>
                <label style={styles.label}>
                    Cutoff Frequency: {cutoffFreq}Hz
                </label>
                <input
                    type="range"
                    value={cutoffFreq}
                    onChange={(e) => onCutoffChange(Number((e.target as HTMLInputElement).value))}
                    {...frequencyRangeProps}
                    style={styles.input}
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>
                    Q Factor (Peak): {qFactor.toFixed(1)}
                </label>
                <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={qFactor}
                    onChange={(e) => onQChange(Number((e.target as HTMLInputElement).value))}
                    style={styles.input}
                />
            </div>
        </div>
    );
};

// Filter Visualization Component (SVG Graph)
const FilterVisualization = ({ type, cutoffFreq, qFactor }: { type: 'highpass' | 'lowpass'; cutoffFreq: number; qFactor: number }) => {
    const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
    const freqTicks = generateFrequencyTicks();

    useEffect(() => {
        const newPoints = generateFilterPoints(cutoffFreq, qFactor, type);
        setPoints(newPoints);
    }, [cutoffFreq, qFactor, type]);

    const filterColor = type === 'highpass' ? colors.blue : colors.red;
    const filterLabel = type === 'highpass' ? 'HPF' : 'LPF';

    return (
        <Graphics>
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                {/* X-axis */}
                <line x1="0" y1={GRAPH_HEIGHT} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT} stroke={colors.surface2} stroke-width="3" />
                {/* Y-axis */}
                <line x1="0" y1="0" x2="0" y2={GRAPH_HEIGHT} stroke={colors.surface2} stroke-width="3" />

                {/* X-axis labels */}
                <text x={GRAPH_WIDTH / 2} y={GRAPH_HEIGHT + 25} textAnchor="middle" fontSize="10" fill={colors.text}>Frequency (Hz)</text>
                {freqTicks.map((tick, i) => (
                    <g key={i}>
                        <line x1={tick.x} y1={GRAPH_HEIGHT} x2={tick.x} y2={GRAPH_HEIGHT + 5} stroke={colors.surface2} />
                        <text x={tick.x} y={GRAPH_HEIGHT + 15} textAnchor="middle" fontSize="8" fill={colors.subtext0}>{tick.label}</text>
                    </g>
                ))}

                {/* Y-axis label */}
                <text transform="rotate(-90)" y="-30" x={-GRAPH_HEIGHT / 2} textAnchor="middle" fontSize="10" fill={colors.text}>Level</text>

                {/* Filter cutoff indicator */}
                <line
                    x1={logFreqToX(cutoffFreq)}
                    y1="0"
                    x2={logFreqToX(cutoffFreq)}
                    y2={GRAPH_HEIGHT}
                    stroke={filterColor}
                    stroke-dasharray="3,3"
                    stroke-width="2"
                />
                <text
                    x={logFreqToX(cutoffFreq)}
                    y="15"
                    textAnchor="middle"
                    fill={filterColor}
                    fontSize="10"
                >
                    {filterLabel}: {cutoffFreq}Hz
                </text>

                {/* Filter response curve */}
                <path
                    d={`M${points.map(pt => `${pt.x},${pt.y}`).join(' L')}`}
                    fill="none"
                    stroke={filterColor}
                    stroke-width="3"
                />
            </g>
        </Graphics>
    );
};

// Filter Component (generic for both high-pass and low-pass)
const Filter = ({ type }: { type: 'highpass' | 'lowpass' }) => {
    // Default values based on filter type
    const defaultCutoffFreq = type === 'highpass' ? 200 : 2000;

    // State
    const cutoffFreq = useSignal(defaultCutoffFreq);
    const qFactor = useSignal(1);

    return (
        <>
            <FilterVisualization
                type={type}
                cutoffFreq={cutoffFreq.value}
                qFactor={qFactor.value}
            />

            <FilterForm
                type={type}
                cutoffFreq={cutoffFreq.value}
                qFactor={qFactor.value}
                onCutoffChange={(value) => { cutoffFreq.value = value; }}
                onQChange={(value) => { qFactor.value = value; }}
            />
        </>
    );
};

// Main App Component
const FilterWrapper = ({ type }: { type: "lowpass" | "highpass" }) => {
    // Audio nodes
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const highpassFilterRef = useRef<BiquadFilterNode | null>(null);
    const lowpassFilterRef = useRef<BiquadFilterNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Signal values for controls
    const highPassFreq = useSignal(200);
    const highPassQ = useSignal(1);
    const lowPassFreq = useSignal(2000);
    const lowPassQ = useSignal(1);
    const oscillatorFreq = useSignal(440);
    const oscillatorType = useSignal<OscillatorType>('sawtooth');
    const volume = useSignal(0.3);

    // Playing state
    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize audio context and nodes
    useEffect(() => {
        if (typeof window !== 'undefined' && !audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

                // Create filters
                highpassFilterRef.current = audioContextRef.current.createBiquadFilter();
                highpassFilterRef.current.type = 'highpass';
                highpassFilterRef.current.frequency.value = highPassFreq.value;
                highpassFilterRef.current.Q.value = highPassQ.value;

                lowpassFilterRef.current = audioContextRef.current.createBiquadFilter();
                lowpassFilterRef.current.type = 'lowpass';
                lowpassFilterRef.current.frequency.value = lowPassFreq.value;
                lowpassFilterRef.current.Q.value = lowPassQ.value;

                // Create gain node
                gainNodeRef.current = audioContextRef.current.createGain();
                gainNodeRef.current.gain.value = volume.value;

                // Connect nodes
                highpassFilterRef.current.connect(lowpassFilterRef.current);
                lowpassFilterRef.current.connect(gainNodeRef.current);
                gainNodeRef.current.connect(audioContextRef.current.destination);
            } catch (error) {
                console.error("Error initializing Web Audio API:", error);
            }
        }

        return () => {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Update filter parameters when signals change
    useEffect(() => {
        if (highpassFilterRef.current) {
            highpassFilterRef.current.frequency.value = highPassFreq.value;
            highpassFilterRef.current.Q.value = highPassQ.value;
        }

        if (lowpassFilterRef.current) {
            lowpassFilterRef.current.frequency.value = lowPassFreq.value;
            lowpassFilterRef.current.Q.value = lowPassQ.value;
        }

        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume.value;
        }

        if (oscillatorRef.current && oscillatorRef.current.frequency) {
            oscillatorRef.current.frequency.value = oscillatorFreq.value;
            // Oscillator type can't be changed after creation
        }
    }, [highPassFreq.value, highPassQ.value, lowPassFreq.value, lowPassQ.value, volume.value, oscillatorFreq.value]);

    // Toggle sound playback
    const toggleSound = () => {
        if (isPlaying) {
            stopSound();
        } else {
            playSound();
        }
    };

    // Stop sound
    const stopSound = () => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
                oscillatorRef.current = null;
                setIsPlaying(false);
            } catch (error) {
                console.error("Error stopping sound:", error);
            }
        }
    };

    // Play sound
    const playSound = () => {
        if (!audioContextRef.current) return;

        try {
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            oscillatorRef.current = audioContextRef.current.createOscillator();
            oscillatorRef.current.type = oscillatorType.value;
            oscillatorRef.current.frequency.value = oscillatorFreq.value;

            oscillatorRef.current.connect(highpassFilterRef.current!);
            oscillatorRef.current.start();

            setIsPlaying(true);
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    const styles = {
        container: {
            maxWidth: WIDTH,
            margin: '0 auto',
            padding: PADDING,
            backgroundColor: colors.crust,
            color: colors.text,
            fontFamily: 'sans-serif'
        },
        header: {
            textAlign: 'center',
            color: colors.mauve,
            marginBottom: '20px'
        },
        controls: {
            backgroundColor: colors.base,
            padding: '12px',
            borderRadius: '4px',
            border: `1px solid ${colors.surface0}`,
            marginTop: '20px'
        },
        controlsTitle: {
            margin: '0 0 12px 0',
            color: colors.lavender,
            fontWeight: 'bold'
        },
        formGroup: {
            marginBottom: '12px'
        },
        label: {
            display: 'block',
            marginBottom: '4px',
            color: colors.text
        },
        input: {
            width: '100%',
            accentColor: colors.lavender
        },
        button: {
            backgroundColor: isPlaying ? colors.red : colors.green,
            color: colors.text,
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            marginTop: '8px'
        },
        select: {
            backgroundColor: colors.surface0,
            color: colors.text,
            border: `1px solid ${colors.surface1}`,
            padding: '6px',
            borderRadius: '4px',
            width: '100%'
        }
    };

    return (
        <>
            {/* Graphics filter visualization */}
            <Filter type={type} />

            {/* Sound Controls */}
            <SettingsPopup>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Oscillator Type</label>
                    <select
                        style={styles.select}
                        value={oscillatorType.value}
                        onChange={(e) => { oscillatorType.value = (e.target as HTMLSelectElement).value as OscillatorType; }}
                    >
                        <option value="sine">Sine</option>
                        <option value="square">Square</option>
                        <option value="sawtooth">Sawtooth</option>
                        <option value="triangle">Triangle</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Oscillator Frequency: {oscillatorFreq.value}Hz</label>
                    <input
                        type="range"
                        min="20"
                        max="2000"
                        step="1"
                        value={oscillatorFreq.value}
                        onChange={(e) => { oscillatorFreq.value = Number((e.target as HTMLInputElement).value); }}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Volume: {Math.round(volume.value * 100)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume.value}
                        onChange={(e) => { volume.value = Number((e.target as HTMLInputElement).value); }}
                        style={styles.input}
                    />
                </div>

                <button onClick={toggleSound} style={styles.button}>
                    {isPlaying ? 'Stop Sound' : 'Play Sound'}
                </button>
            </SettingsPopup></>
    );
};


export const HighPassFilter: FunctionalComponent = () => <FilterWrapper type="highpass" />
export const LowPassFilter: FunctionalComponent = () => <FilterWrapper type="lowpass" />

/** un composant preact */
export function OldHighPassFilter() {
    return (<>
        <Graphics>
            <circle cx="5" cy="5" r="10" style="fill:#11111b;" />
            <rect
                x="0"
                y="5"
                width="150"
                height="200"
                class="fragment"
                style="fill:#11111b;stroke:#fab387;stroke-width:3;stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:10;stroke-dasharray:none"
            />
        </Graphics>
        <SettingsPopup>
            <form>
                <label>Frequency Cutoff</label><input type="range" />
            </form>
        </SettingsPopup>
    </>
    );
}
