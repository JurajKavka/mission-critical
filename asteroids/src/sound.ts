export interface Sound {
  start: () => void;
  tone: (
    frequency: number,
    duration: number,
    volume?: number,
    type?: OscillatorType,
    endFrequency?: number,
  ) => void;
}

export const createSound = (): Sound => {
  let context: AudioContext | null = null;

  const start = (): void => {
    context ??= new AudioContext();
    void context.resume();
  };

  const tone: Sound['tone'] = (
    frequency,
    duration,
    volume = 0.025,
    type = 'sine',
    endFrequency = frequency * 0.62,
  ) => {
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(35, endFrequency),
      context.currentTime + duration,
    );
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + duration,
    );
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  return { start, tone };
};
