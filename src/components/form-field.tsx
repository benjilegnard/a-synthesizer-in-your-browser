import { flavors } from "@catppuccin/palette";
import { FunctionalComponent } from "preact";

const { colors } = flavors.mocha;

interface FormFieldProps {
    centered?: boolean;
}

export const FormField: FunctionalComponent<FormFieldProps> = ({ children, centered }) => {
    return (<div class="form-field" style={{
        color: colors.text.hex,
        dislay: "flex",
        flexDirection: "column",
        textAlign: centered ? "center" : "left"
    }} >
        {children}
        <style>{`
            .form-field input[type=range] {
                width: 100%;
            }
        `}</style>
    </div>);
}
