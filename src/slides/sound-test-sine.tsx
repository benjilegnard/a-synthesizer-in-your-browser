import { Button } from "../components/button";
import { Graphics } from "../components/graphics";
import { useSignal } from "@preact/signals";
import { useAudioContext } from "../hooks/use-audio-context.hook";

let oscillator: OscillatorNode;
let context: AudioContext;
/**
 * Slide explaining what is sound in the air
 *
 * but caché, tester que le son fonctionne.
 */
export const SineSound = () => {
    const isPlaying = useSignal<boolean>(false);
    // const { context, play, pause } = useAudioContext();

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
            <Button
                style={{ position: "absolute", left: "50%", top: "50%" }}
                onClick={toggleSound}
            >
                {isPlaying.value ? (<span>⏹️ Stop</ span >) : (<span> 🔈 Play </span>)}
            </Button>
            < Graphics >
                <g>{} </g>
            </Graphics>
        </>
    );
};
