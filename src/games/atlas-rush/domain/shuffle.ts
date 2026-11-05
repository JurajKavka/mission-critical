// Version 1 also covers the preserved region membership and source ID order.
export const challengeVersion = 1;
export const defaultSeed = 'atlas-rush-v1';

const hashSeed = (seed: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 0x01000193);
  }
  return hash >>> 0;
};

// All mutable PRNG state belongs to this invocation, never the module.
const createSeededRandom = (seed: string): (() => number) => {
  let state = hashSeed(seed);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffleTargetIds = (
  targetIds: readonly string[],
  seed: string,
): readonly string[] => {
  const shuffled = [...targetIds];
  const random = createSeededRandom(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [
      shuffled[otherIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};
