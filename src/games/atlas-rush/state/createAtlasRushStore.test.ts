import { describe, expect, it } from 'vitest';
import { regionTargets } from '../data/targets';
import { createConfig } from '../domain/test-fixtures';
import { createAtlasRushStore } from './createAtlasRushStore';
import { selectGuessedIds, selectRegionId } from './selectors';

const createHarness = () => {
  let now = 0;
  const store = createAtlasRushStore(createConfig(), { now: () => now });
  return {
    store,
    advance: (seconds: number) => {
      now += seconds * 1000;
    },
  };
};

const answerForCurrentTarget = (
  store: ReturnType<typeof createAtlasRushStore>,
) => {
  const session = store.getState().session;
  return (
    regionTargets[session.config.regionId].find(
      (target) => target.id === session.remainingIds[0],
    )?.name ?? ''
  );
};

describe('Atlas Rush store', () => {
  it('tracks active time across wrong guesses, skips, pause and resume', () => {
    const { store, advance } = createHarness();
    store.getState().startGame();
    advance(2);
    expect(store.getState().submitGuess('wrong').outcome).toBe('incorrect');
    advance(3);
    store.getState().skipCountry();
    expect(store.getState().session.elapsedSeconds).toBe(5);
    advance(2);
    store.getState().pauseGame();
    expect(store.getState().session.phase).toBe('paused');
    expect(store.getState().session.elapsedSeconds).toBe(7);
    advance(100);
    expect(store.getState().getRemainingSeconds()).toBe(533);
    store.getState().resumeGame();
    advance(3);
    expect(
      store.getState().submitGuess(answerForCurrentTarget(store)).outcome,
    ).toBe('correct');
    expect(store.getState().session.elapsedSeconds).toBe(10);
    expect(store.getState().session.guessedIds).toHaveLength(1);
  });

  it('expires before actions and preserves phase guards', () => {
    const { store, advance } = createHarness();
    expect(store.getState().submitGuess('x').outcome).toBe('ignored');
    store.getState().resumeGame();
    expect(store.getState().session.phase).toBe('ready');
    store.getState().startGame();
    const playing = store.getState().session;
    store.getState().startGame();
    expect(store.getState().session).toBe(playing);
    advance(540);
    expect(
      store.getState().submitGuess(answerForCurrentTarget(store)).outcome,
    ).toBe('timeout');
    expect(store.getState().session.finishReason).toBe('timeout');
    store.getState().resetGame();
    expect(store.getState().session.phase).toBe('ready');
    expect(store.getState().session.elapsedSeconds).toBe(0);
  });

  it('allows an external timer to finish a round only on expiry', () => {
    const { store, advance } = createHarness();
    store.getState().startGame();
    advance(10);
    store.getState().finishGame();
    expect(store.getState().session.phase).toBe('playing');
    advance(530);
    store.getState().finishGame();
    expect(store.getState().session.phase).toBe('finished');
  });

  it('checkpoints active time without changing progress and expires at the deadline', () => {
    const { store, advance } = createHarness();
    store.getState().startGame();
    const queue = store.getState().session.remainingIds;
    advance(4);
    store.getState().checkpointGame();
    expect(store.getState().session.elapsedSeconds).toBe(4);
    expect(store.getState().session.remainingIds).toBe(queue);
    advance(3);
    expect(store.getState().getRemainingSeconds()).toBe(533);
    advance(533);
    store.getState().checkpointGame();
    expect(store.getState().session.finishReason).toBe('timeout');
  });

  it('restores valid active snapshots paused and rejects invalid data without changes', () => {
    const { store, advance } = createHarness();
    store.getState().startGame();
    advance(4);
    store.getState().skipCountry();
    const snapshot = store.getState().session;
    expect(
      store.getState().restoreGame({ ...snapshot, remainingIds: [] }),
    ).toBe(false);
    expect(store.getState().session).toBe(snapshot);
    expect(store.getState().restoreGame(snapshot)).toBe(true);
    expect(store.getState().session.phase).toBe('paused');
    expect(store.getState().session.remainingIds).not.toBe(
      snapshot.remainingIds,
    );
    advance(100);
    expect(store.getState().getRemainingSeconds()).toBe(536);
    store.getState().resumeGame();
    advance(2);
    expect(store.getState().getRemainingSeconds()).toBe(534);
  });

  it('keeps stores isolated and narrow selected references stable', () => {
    const first = createHarness();
    const second = createHarness();
    let regionChanges = 0;
    let guessedChanges = 0;
    let region = selectRegionId(first.store.getState());
    let guessed = selectGuessedIds(first.store.getState());
    const unsubscribe = first.store.subscribe((state) => {
      const nextRegion = selectRegionId(state);
      const nextGuessed = selectGuessedIds(state);
      if (nextRegion !== region) {
        regionChanges += 1;
        region = nextRegion;
      }
      if (nextGuessed !== guessed) {
        guessedChanges += 1;
        guessed = nextGuessed;
      }
    });
    first.store.getState().startGame();
    const guessedAfterStart = selectGuessedIds(first.store.getState());
    first.store.getState().skipCountry();
    first.store.getState().pauseGame();
    expect(selectGuessedIds(first.store.getState())).toBe(guessedAfterStart);
    expect(regionChanges).toBe(0);
    expect(guessedChanges).toBe(1);
    expect(second.store.getState().session.phase).toBe('ready');
    unsubscribe();
  });
});
