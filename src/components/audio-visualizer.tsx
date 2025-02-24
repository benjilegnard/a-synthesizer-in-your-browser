// TODO audio visualizer
// @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

import { FunctionComponent } from "preact";

interface AudioVisualizerProps {
    audioContext: AudioContext;
}

/** Component to put in an svg to visualize sound */
export const AudioVisualizer: FunctionComponent<AudioVisualizerProps> = ({ audioContext }) => {
    return <g></g>
}
