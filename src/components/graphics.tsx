import { FunctionalComponent } from "preact";

/**
 * an SVG graphics container, always the same size and same background
 */
export const Graphics: FunctionalComponent = (props) => (
    <svg width="1280" height="720" viewBox="0 0 1280 720">
        <rect
            id="background"
            width="1280"
            height="720"
            fill="#11111b"
            stroke="none" />
        {props.children}
    </svg>
);
