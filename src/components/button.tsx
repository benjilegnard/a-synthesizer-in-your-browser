import { flavors } from "@catppuccin/palette";
import { FunctionalComponent } from "preact";

const { colors } = flavors.mocha;

interface ButtonProps {
    onClick: (event: MouseEvent) => void;
}
export const Button: FunctionalComponent<ButtonProps> = (props) => (
    <button
        style={{
            border: `solid 2px ${colors.teal.hex}`,
            padding: "24px",
            background: colors.surface0.hex,

        }}
    >
        {props.children}
    </button>
);
