import { FunctionalComponent } from "preact";
import { Graphics } from "../components/graphics";
import { SettingsPopup } from "../components/settings-popup";

export const Digitalization: FunctionalComponent = () => {
    return (<>
        <Graphics>{/* TODO */}</Graphics>
        <SettingsPopup>{"text"}</SettingsPopup>
    </>)
}
