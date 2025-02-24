import { Button } from "../components/button";
import { Graphics } from "../components/graphics";

export const Trigonometry = () => (
    <>
        <Graphics />
        <Button
            style={{ position: "absolute", left: "50%", top: "50%" }}
            onClick={() => alert("clicked")}>🔈 Play</Button>
    </>
);
