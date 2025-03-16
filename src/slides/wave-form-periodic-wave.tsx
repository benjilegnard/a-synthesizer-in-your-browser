import { useState, useEffect, useRef } from "preact/hooks";
import { SettingsPopup } from "../components/settings-popup";
import { Graphics } from "../components/graphics";
import { FunctionalComponent } from "preact";

export const WaveformPeriodicWave: FunctionalComponent = () => {
    const [pulseWidth, setPulseWidth] = useState(0.5);
    const [harmonics, setHarmonics] = useState(32);
    const [waveformType, setWaveformType] = useState<"sawtooth" | "pulse">("sawtooth"); // "pulse" or "sawtooth"
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtxRef = useRef<AudioContext>(null);
    const oscRef = useRef<OscillatorNode>(null);

    useEffect(() => {
        if (isPlaying) {
            startAudio();
        } else {
            stopAudio();
        }
    }, [isPlaying, pulseWidth, harmonics, waveformType]);

    const startAudio = () => {
        stopAudio();
        audioCtxRef.current = new (window.AudioContext)();
        oscRef.current = audioCtxRef.current.createOscillator();

        const wave = waveformType === "pulse"
            ? createPulseWave(audioCtxRef.current, pulseWidth, harmonics)
            : createSawTriangleWave(audioCtxRef.current, pulseWidth, harmonics);

        oscRef.current.setPeriodicWave(wave);
        oscRef.current.frequency.value = 440;
        oscRef.current.connect(audioCtxRef.current.destination);
        oscRef.current.start();
    };

    const stopAudio = () => {
        if (oscRef.current) {
            oscRef.current.stop();
            oscRef.current.disconnect();
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
        }
        audioCtxRef.current = null;
        oscRef.current = null;
    };

    const createPulseWave = (audioCtx: AudioContext, pulseWidth: number, harmonics: number) => {
        let real = new Float32Array(harmonics);
        let imag = new Float32Array(harmonics);

        for (let n = 1; n < harmonics; n++) {
            let theta = Math.PI * pulseWidth * n;
            real[n] = 0;
            imag[n] = Math.sin(theta) / (Math.PI * n);
        }

        return audioCtx.createPeriodicWave(real, imag);
    };

    const createSawTriangleWave = (audioCtx: AudioContext, pulseWidth: number, harmonics: number) => {
        let real = new Float32Array(harmonics);
        let imag = new Float32Array(harmonics);

        for (let n = 1; n < harmonics; n++) {
            let sign = (n % 2 === 0) ? -1 : 1;
            let sawCoeff = 1 / n;
            let triCoeff = sign / (n * n);

            let mix = 1 - Math.abs(2 * pulseWidth - 1);
            let coeff = mix * triCoeff + (1 - mix) * sawCoeff;

            real[n] = 0;
            imag[n] = coeff * (pulseWidth < 0.5 ? 1 : -1);
        }

        return audioCtx.createPeriodicWave(real, imag);
    };

    const generateWavePath = () => {
        const width = 400;
        const height = 200;
        const numSamples = 100;
        const points = [];
        const freq = 2 * Math.PI;

        for (let i = 0; i < numSamples; i++) {
            let x = (i / (numSamples - 1)) * width;
            let y = Math.sin(freq * i / numSamples) * (height / 2) + height / 2;
            points.push(`${x},${y}`);
        }

        return points.join(" ");
    };

    return (<><Graphics>
        <polyline points={generateWavePath()} fill="none" stroke="black" strokeWidth="2" />
    </Graphics>
        <SettingsPopup>
            <form style={{ marginTop: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px" }}>
                    <strong>Waveform Type:</strong>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="waveform"
                                value="sawtooth"
                                checked={waveformType === "sawtooth"}
                                onChange={() => setWaveformType("sawtooth")}
                            />
                            Sawtooth/Triangle
                        </label>
                        <label style={{ marginLeft: "10px" }}>
                            <input
                                type="radio"
                                name="waveform"
                                value="pulse"
                                checked={waveformType === "pulse"}
                                onChange={() => setWaveformType("pulse")}
                            />
                            Pulse Wave
                        </label>
                    </div>
                </label>
                <label style={{ display: "block", marginBottom: "10px" }}>
                    <strong>Pulse Width:</strong> {pulseWidth.toFixed(2)}
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={pulseWidth}
                        onChange={(e) => setPulseWidth(parseFloat(e.currentTarget.value))}
                        style={{ width: "100%" }}
                    />
                </label>
                <label style={{ display: "block", marginBottom: "10px" }}>
                    <strong>Harmonics:</strong> {harmonics}
                    <input
                        type="range"
                        min="1"
                        max="64"
                        step="1"
                        value={harmonics}
                        onChange={(e) => setHarmonics(parseInt(e.currentTarget.value, 10))}
                        style={{ width: "100%" }}
                    />
                </label>
                <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                        width: "100%",
                        background: isPlaying ? "#d9534f" : "#5cb85c",
                        color: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "none",
                        fontSize: "16px",
                        fontWeight: "bold"
                    }}
                >
                    {isPlaying ? "Stop" : "Start"}
                </button>
            </form>
        </SettingsPopup></>
    );
};


