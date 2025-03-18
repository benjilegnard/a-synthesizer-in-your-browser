import { Graphics } from "../components/graphics";
import { useSignal } from "@preact/signals";
import { PlayPauseButton } from "../components/play-pause";
import { SettingsPopup } from "../components/settings-popup";
import { WaveformVisualizer } from "../components/wave-form-visualizer";
import { HEIGHT, WIDTH } from "../common/constants";


let context: AudioContext;
let whiteNoise: AudioBufferSourceNode;
let analyserNode: AnalyserNode;
/**
 * Slide explaining what is sound in the air
 *
 * but caché, tester que le son fonctionne.
 */
export const NoiseSound = () => {
    const isPlaying = useSignal<boolean>(false);
    // const { context, play, pause } = useAudioContext();

    const toggleSound = () => {
        if (!isPlaying.value) {
            context = new AudioContext();
            var bufferSize = 2 * context.sampleRate,
                noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate),
                output = noiseBuffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            whiteNoise = context.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;
            whiteNoise.start(0);
            whiteNoise.connect(context.destination);

            analyserNode = context.createAnalyser();
            whiteNoise.connect(analyserNode);
            //play();
        }

        if (isPlaying.value) {
            // pause();
            whiteNoise?.disconnect();
        }
        isPlaying.value = !isPlaying.value;
    }

    return (
        <>
            <div style={{ position: "absolute" }}>
                <WaveformVisualizer analyserNode={analyserNode} />
            </div>
            <PlayPauseButton
                isPlaying={isPlaying.value}
                onClick={toggleSound}
            />
            <Graphics>
                <g></g>
            </Graphics>
            <SettingsPopup />
        </>
    )
};
