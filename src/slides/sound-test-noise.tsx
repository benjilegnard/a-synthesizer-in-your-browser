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
export const Sound = () => {
    const isPlaying = useSignal<boolean>(false);
    // const { context, play, pause } = useAudioContext();

    const toggleSound = () => {
        if (!isPlaying.value) {
            console.log("play");
            context = new AudioContext();
            // create stuff
            oscillator = context.createOscillator();
            oscillator.type = "sine"
            // oscillator.frequency.value = 440;
            const real = new Float32Array(18);
            const imag = new Float32Array(18);
            for (let i = 0; i < 18; i++) {
                real[i] = Math.random();
                imag[i] = Math.random();
            }
            oscillator.setPeriodicWave(context.createPeriodicWave(real, imag))
            oscillator.start();
            oscillator.connect(context.destination);
            //play();
        }

        if (isPlaying.value) {
            console.log("pause");
            // pause();
            oscillator?.disconnect();
        }
        isPlaying.value = !isPlaying.value;
    }

    return (
        <>
            <Button
                style={{ position: "absolute", left: "50%", top: "50%" }}
                onClick={toggleSound}>
                {isPlaying.value ? (<span>⏹️ Stop</span>) : (<span> 🔈 Play</span>)}
            </Button>
            <Graphics>
                <g>
                    {

                    }
                </g>
            </Graphics>
        </>
    )
};
