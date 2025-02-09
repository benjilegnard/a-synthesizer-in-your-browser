import { flavors } from "@catppuccin/palette";
import { FunctionalComponent } from "preact";

const { colors } = flavors.mocha;

export const Button: FunctionalComponent = (props) => (
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
