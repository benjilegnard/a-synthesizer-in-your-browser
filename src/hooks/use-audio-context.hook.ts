import { useEffect } from "preact/hooks";

export function getAudioContextSingleton() {
  let context: AudioContext | undefined = undefined;

  function createAudioCtx() {
    return new AudioContext();
  }

  return () => {
    if (!context) {
      context = createAudioCtx();
    }
    return context;
  };
}

export function useAudioContext() {
  const context: AudioContext = getAudioContextSingleton()();

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
}
