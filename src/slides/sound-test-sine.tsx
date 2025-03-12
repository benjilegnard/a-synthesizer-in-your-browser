import { Graphics } from "../components/graphics";
import { useSignal } from "@preact/signals";
import { PlayPauseButton } from "../components/play-pause";

let oscillator: OscillatorNode;
let context: AudioContext;

/**
 * Slide explaining what is sound in the air
 *
 * but caché, tester que le son fonctionne.
 */
export const SineSound = () => {
    const isPlaying = useSignal<boolean>(false);

    const toggleSound = () => {
        if (!isPlaying.value) {
            context = new AudioContext();
            // create stuff
            oscillator = context.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.value = 440;
            oscillator.start();
            oscillator.connect(context.destination);
            //play();
        }

        if (isPlaying.value) {
            // pause();
            oscillator?.disconnect();
        }
        isPlaying.value = !isPlaying.value;
    }

    return (
        <>
            <PlayPauseButton
                isPlaying={isPlaying.value}
                onClick={toggleSound}
            >
            </PlayPauseButton>
            <Graphics>
                <g>{}</g>
            </Graphics>
        </>
    );
};
