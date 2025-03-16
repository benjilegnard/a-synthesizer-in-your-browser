import { Graphics } from "../components/graphics";
import { useSignal } from "@preact/signals";
import { PlayPauseButton } from "../components/play-pause";
import { SettingsPopup } from "../components/settings-popup";


let context: AudioContext;
let whiteNoise: AudioBufferSourceNode;
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
            console.log("play");
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
            //play();
        }

        if (isPlaying.value) {
            console.log("pause");
            // pause();
            whiteNoise?.disconnect();
        }
        isPlaying.value = !isPlaying.value;
    }

    return (
        <>
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
