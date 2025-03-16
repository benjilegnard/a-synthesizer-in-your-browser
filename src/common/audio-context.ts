import { useEffect } from "preact/hooks";

const context = new AudioContext();

interface AudioContextWrapper {
  context: AudioContext;
  analyser: AnalyserNode;
  gainNode: GainNode;
}

export const useAudioContext = () => {
  /** Suspend the audio context */
  function pause() {
    context.suspend();
  }

  /** Resume the audio context */
  function play() {
    context.resume();
  }

  useEffect(() => {
    /** auto-play is very rude */
    if (context.state === "running") {
      context.suspend();
    }

    return () => {
      context.close();
    };
  }, [context]);

  return { context, pause, play };
};
