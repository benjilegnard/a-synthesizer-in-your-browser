import "./style.scss";

import "reveal.js/plugin/highlight/highlight.esm";

import Reveal from "reveal.js";
import Markdown from "reveal.js/plugin/markdown/markdown";
import Notes from "reveal.js/plugin/notes/notes";
import Highlight from "reveal.js/plugin/highlight/highlight";
import { HighPass } from "./slides/high-pass";
import { render } from "preact";

let deck = new Reveal({
    plugins: [Markdown, Notes, Highlight],
});

deck.initialize({
    progress: false,
    controls: false,
    slideNumber: "c/t",
    showSlideNumber: "speaker",
    hashOneBasedIndex: true,
    hash: true,
    transition: "none",
    backgroundTransition: "none",
    history: true,
}).then(() => {
    render(<HighPass/>, document.getElementById("high-pass"));
});

