import { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { FrequencyVisualizer } from '../components/frequency-visualizer';
import { WaveformVisualizer } from '../components/wave-form-visualizer';

// Main component that handles the audio graph
interface AudioPlayerProps {
    frequency?: number;
}

export const AudioPlayer: FunctionComponent<AudioPlayerProps> = ({ frequency = 440 }) => {
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
        </div>
    );
};

