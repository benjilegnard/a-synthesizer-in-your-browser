import "./style.scss";

import "reveal.js/plugin/highlight/highlight.esm";

import { ComponentChild, render } from "preact";
import Reveal from "reveal.js";
import Markdown from "reveal.js/plugin/markdown/markdown";
import Notes from "reveal.js/plugin/notes/notes";
import Highlight from "reveal.js/plugin/highlight/highlight";
import RevealMath from "reveal.js/plugin/math/math";

import { HighPass } from "./slides/filter-high-pass";
import { SineSound } from "./slides/sound-test-sine";
import { NoiseSound } from "./slides/sound-test-noise";
import { TrigonometricCircle } from "./slides/trigonometric-circle";
import { FourierSquareWave } from "./slides/fourier-square-wave";

let deck = new Reveal({
    plugins: [Markdown, Notes, Highlight, RevealMath.KaTeX],
});


const components: Record<string, ComponentChild> = {
    "high-pass": <HighPass />,
    "trigonometric-circle": <TrigonometricCircle />,
    "sound-test-sine": <SineSound />,
    "sound-test-noise": <NoiseSound />,
    "fourier-square-wave": <FourierSquareWave />
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

// execute order 66 ( remove B to "pause" keybinding )
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 66) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        // todo execute slide animation
    }
});
document.addEventListener("keypress", (event) => {
    event.preventDefault();
    console.log("key", event.key);
    const mappings: Record<string, () => void> = {
        h: Reveal.left,
        j: Reveal.down,
        k: Reveal.up,
        l: Reveal.right,
    };
    mappings[event.key] ?? mappings[event.key]();
});
