import { flavors } from "@catppuccin/palette";
import { FunctionalComponent } from "preact";
import { CSSProperties } from "preact/compat";

const { colors } = flavors.mocha;

interface ButtonProps {
    style?: CSSProperties;
    onClick?: (event: MouseEvent) => void;
}
export const Button: FunctionalComponent<ButtonProps> = (props) => {
    const baseColor = colors.teal.hex;
    return (
        <button
            style={{
                border: `solid 2px ${baseColor}`,
                padding: "10px",
                cursor: "pointer",
                color: baseColor,
                borderRadius: "3rem",
                background: colors.mantle.hex,
                ...props.style,
            }}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    )
};
