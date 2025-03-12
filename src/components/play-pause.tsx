import { FunctionComponent } from "preact";
import { Button } from "./button";

export interface PlayPauseProps {
    isPlaying: boolean;
    onClick: (event: MouseEvent) => void
}
export const PlayPauseButton: FunctionComponent<PlayPauseProps> = ({ isPlaying, onClick }) => {
    return (<Button
        style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
        }}
        onClick={onClick}>
        {isPlaying ? (<span>⏹️ Stop</ span >) : (<span> 🔈 Play </span>)}
    </Button>
    )
}
