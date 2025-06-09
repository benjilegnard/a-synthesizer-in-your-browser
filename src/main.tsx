import "./style.scss";

import "reveal.js/plugin/highlight/highlight.esm";

import { ComponentChild, render } from "preact";
import Reveal from "reveal.js";
import Markdown from "reveal.js/plugin/markdown/markdown";
import Notes from "reveal.js/plugin/notes/notes";
import Highlight from "reveal.js/plugin/highlight/highlight";
import RevealMath from "reveal.js/plugin/math/math";

import { HighPassFilter, LowPassFilter } from "./slides/filter-high-pass";
import { SineSound } from "./slides/sound-test-sine";
import { NoiseSound } from "./slides/sound-test-noise";
import { OscillatorOneEnvelopeGenerator, OscillatorTwoEnvelopeGenerator } from "./slides/envelope-generator-1";
import { TrigonometricCircle } from "./slides/trigonometric-circle";
import { FourierSquareWave } from "./slides/fourier-square-wave";
import { Digitalization } from "./slides/digitalization";
import { AudioPlayer } from "./slides/audio-test-player";

let deck = new Reveal({
    plugins: [Markdown, Notes, Highlight, RevealMath.KaTeX],
});


const components: Record<string, ComponentChild> = {
    "high-pass-filter": <HighPassFilter />,
    "low-pass-filter": <LowPassFilter />,
    "trigonometric-circle": <TrigonometricCircle />,
    "digitalization": <Digitalization />,
    "sound-test-sine": <SineSound />,
    "sound-test-noise": <NoiseSound />,
    "envelope-generator-1": <OscillatorOneEnvelopeGenerator />,
    "envelope-generator-2": <OscillatorTwoEnvelopeGenerator />,
    "fourier-square-wave": <FourierSquareWave />,
    "audio-test-player": <AudioPlayer />,
};

deck
    .initialize({
        progress: false,
        controls: false,
        slideNumber: "c/t",
        showSlideNumber: "speaker",
        hashOneBasedIndex: true,
        hash: true,
        pause: false,
        transition: "none",
        backgroundTransition: "none",
        history: true,
        pdfSeparateFragments: false,
        keyboard: { b: null } as unknown as boolean,
    })
    .then(() => {
        // initialize preact components in slides
        Object.keys(components).forEach((id) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id ${id} is missing!`);
                return;
            }
            render(components[id], element);
        });
    });

