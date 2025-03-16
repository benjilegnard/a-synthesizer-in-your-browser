import { FunctionComponent } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { FrequencyVisualizer } from '../components/frequency-visualizer';

// Waveform visualization component
interface WaveformVisualizerProps {
    analyserNode: AnalyserNode | null;
    width?: number;
    height?: number;
}

const WaveformVisualizer: FunctionComponent<WaveformVisualizerProps> = ({
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
            canvasCtx.fillStyle = 'rgb(20, 20, 30)';
            canvasCtx.fillRect(0, 0, width, height);

            // Draw waveform
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 200, 150)';
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

// Main component that handles the audio graph
interface AudioPlayerProps {
    frequency?: number;
}

const AudioPlayer: FunctionComponent<AudioPlayerProps> = ({ frequency = 440 }) => {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    // Initialize the audio context
    const initAudio = () => {
        if (audioContext) return;

        // Create new audio context
        const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create analyser node
        const newAnalyser = newAudioContext.createAnalyser();
        newAnalyser.fftSize = 2048;
        newAnalyser.connect(newAudioContext.destination);

        setAudioContext(newAudioContext);
        setAnalyser(newAnalyser);
    };

    // Toggle play/stop audio
    const toggleAudio = () => {
        // Initialize audio if not already done
        if (!audioContext) {
            initAudio();
            // Return early to give time for audio context to initialize
            // The useEffect below will handle starting audio playback once context is ready
            return;
        }

        if (!isPlaying) {
            // Start playing
            const newOscillator = audioContext.createOscillator();
            newOscillator.type = 'sine';
            newOscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

            // Connect oscillator to analyser
            newOscillator.connect(analyser!);
            newOscillator.start();

            setOscillator(newOscillator);
            setIsPlaying(true);
        } else {
            // Stop playing
            if (oscillator) {
                oscillator.stop();
                oscillator.disconnect();
            }
            setOscillator(null);
            setIsPlaying(false);
        }
    };

    // Effect to start playing once audio context is initialized
    useEffect(() => {
        if (audioContext && analyser && !oscillator && !isPlaying) {
            // If we just initialized the audio context due to user interaction,
            // we can automatically start playing
            if (audioContext.state === 'running') {
                toggleAudio();
            }
        }
    }, [audioContext, analyser]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (oscillator) {
                oscillator.stop();
                oscillator.disconnect();
            }
            if (audioContext) {
                audioContext.close();
            }
        };
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '650px', margin: '0 auto' }}>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={toggleAudio}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: isPlaying ? '#ff5555' : '#55aa55',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying ? 'Stop' : 'Play'} {frequency}Hz Sine Wave
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Waveform Visualization</h3>
                <WaveformVisualizer analyserNode={analyser} />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Frequency Spectrum</h3>
                <FrequencyVisualizer analyserNode={analyser} />
            </div>

            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                <p>The top visualizer displays the waveform of a {frequency}Hz sine wave.</p>
                <p>The bottom visualizer shows the frequency spectrum with the {frequency}Hz peak.</p>
                <p>The Web Audio API creates and analyzes the audio signal in real-time.</p>
            </div>
        </div>
    );
};

export default AudioPlayer;
