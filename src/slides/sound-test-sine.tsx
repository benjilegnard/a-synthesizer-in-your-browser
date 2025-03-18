import { Graphics } from "../components/graphics";
import { useSignal } from "@preact/signals";
import { PlayPauseButton } from "../components/play-pause";
import { SettingsPopup } from "../components/settings-popup";
import { FunctionalComponent } from "preact";
import { WaveformVisualizer } from "../components/wave-form-visualizer";
import { HEIGHT, WIDTH } from "../common/constants";

let oscillator: OscillatorNode;
let context: AudioContext;
let analyser: AnalyserNode;
/**
 * Slide explaining what is sound in the air
 *
 * but caché, tester que le son fonctionne.
 */
export const SineSound: FunctionalComponent = () => {
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
            analyser = context.createAnalyser();
            oscillator.connect(analyser);
            context.resume();
            //play();
        }

        if (isPlaying.value) {
            // pause();
            context.suspend();
            oscillator?.disconnect();
            analyser?.disconnect();
        }
        isPlaying.value = !isPlaying.value;
    }

    return (
        <>
            <div style={{ position: "absolute", width: WIDTH, height: HEIGHT }}>
                <WaveformVisualizer analyserNode={analyser} width={WIDTH / 3} height={HEIGHT / 3} />
            </div>
            <PlayPauseButton
                isPlaying={isPlaying.value}
                onClick={toggleSound}
            >
            </PlayPauseButton>
            <Graphics>
                <g>{}</g>
            </Graphics>
            <SettingsPopup />
        </>
    );
};
