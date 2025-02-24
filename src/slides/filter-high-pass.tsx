import { Graphics } from "../components/graphics";

/** un composant preact */
export function HighPass() {
    return (
        <Graphics>
            <circle cx="5" cy="5" r="10" style="fill:#11111b;" />
            <rect
                x="0"
                y="5"
                width="150"
                height="200"
                class="fragment"
                style="fill:#11111b;stroke:#fab387;stroke-width:3;stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:10;stroke-dasharray:none"
            />
        </Graphics>
    );
}
