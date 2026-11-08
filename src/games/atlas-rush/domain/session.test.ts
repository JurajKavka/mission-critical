import { describe, expect, it } from 'vitest';
import { regionTargets } from '../data/targets';
import { levels } from './levels';
import { getCoverage, getResults } from './results';
import {
  createSession,
  finishGame,
  getCommandIndex,
  getCurrentTargetId,
  pauseGame,
  resetGame,
  resumeGame,
  skipCountry,
  startGame,
  submitGuess,
} from './session';
import {
  createConfig,
  freezeSession,
  getCurrentTarget,
  regionIds,
} from './test-fixtures';
import { getRemainingSeconds } from './time';
import type { GameSession } from './types';

describe.each(regionIds)('%s gameplay', (regionId) => {
  it.each(levels)(
    'preserves the $label budget, progression, score and completion',
    (level) => {
      const config = Object.freeze(createConfig({ regionId, level: level.id }));
      const initial = freezeSession(startGame(config));
      const total = regionTargets[regionId].length;
      const expectedSeconds =
        { beginner: 10, middle: 5, expert: 3 }[level.id] * total;
      expect(initial.durationSeconds).toBe(expectedSeconds);
      expect(getRemainingSeconds(initial)).toBe(expectedSeconds);
      expect(initial.remainingIds).toHaveLength(total);
      expect(initial.guessedIds).toEqual([]);
      expect(getResults(initial)).toBeNull();

      let session = initial;
      for (let count = 1; count <= total; count += 1) {
        const target = getCurrentTarget(session);
        const result = submitGuess(
          freezeSession(session),
          target.name,
          count / 2,
        );
        expect(result.outcome).toBe('correct');
        expect(result.targetId).toBe(target.id);
        session = result.session;
        expect(session.guessedIds).toHaveLength(count);
        expect(session.remainingIds).toHaveLength(total - count);
        expect(session.guessedIds.at(-1)).toBe(target.id);
        expect(getCommandIndex(session)).toBe(Math.min(count + 1, total));
        expect(session.durationSeconds).toBe(expectedSeconds);
      }
      expect(session.phase).toBe('finished');
      expect(getCurrentTargetId(session)).toBeNull();
      expect(getResults(session)).toEqual({
        challengeVersion: 1,
        config,
        total,
        correct: total,
        notGuessed: 0,
        coverage: 100,
        elapsedSeconds: total / 2,
        finishReason: 'completed',
      });
      expect(initial.remainingIds).toHaveLength(total);
      expect(initial.guessedIds).toEqual([]);
      expect(finishGame(session, expectedSeconds + 100)).toBe(session);
      expect(getRemainingSeconds(session, expectedSeconds + 100)).toBe(
        expectedSeconds - total / 2,
      );
    },
  );

  it('leaves a wrong answer unchanged, rotates skipped targets and credits only correct answers', () => {
    const initial = freezeSession(startGame(createConfig({ regionId })));
    const wrong = submitGuess(initial, 'not a country or state', 1);
    expect(wrong).toEqual({
      session: initial,
      outcome: 'incorrect',
      targetId: initial.remainingIds[0],
    });
    expect(wrong.session).toBe(initial);
    const skipped = freezeSession(skipCountry(initial, 2));
    expect(skipped.remainingIds).toEqual([
      ...initial.remainingIds.slice(1),
      initial.remainingIds[0],
    ]);
    expect(skipped.guessedIds).toBe(initial.guessedIds);
    expect(getCommandIndex(skipped)).toBe(1);
    expect(getRemainingSeconds(skipped)).toBe(initial.durationSeconds - 2);
    const correct = submitGuess(
      skipped,
      getCurrentTarget(skipped).name,
      3,
    ).session;
    const finished = finishGame(correct, initial.durationSeconds + 100);
    expect(getResults(finished)).toEqual({
      challengeVersion: 1,
      config: initial.config,
      total: initial.remainingIds.length,
      correct: 1,
      notGuessed: initial.remainingIds.length - 1,
      coverage: Math.round(100 / initial.remainingIds.length),
      elapsedSeconds: initial.durationSeconds,
      finishReason: 'timeout',
    });
  });

  it('rotates a full pass back into the same order and skips the final target without losing it', () => {
    const initial = freezeSession(startGame(createConfig({ regionId })));
    let session = initial;
    for (let index = 0; index < initial.remainingIds.length; index += 1) {
      session = skipCountry(freezeSession(session));
    }
    expect(session.remainingIds).toEqual(initial.remainingIds);
    while (session.remainingIds.length > 1) {
      session = submitGuess(
        freezeSession(session),
        getCurrentTarget(session).name,
      ).session;
    }
    const skipped = skipCountry(freezeSession(session), 10);
    expect(skipped.remainingIds).toEqual(session.remainingIds);
    expect(skipped.guessedIds).toEqual(session.guessedIds);
    expect(skipped.phase).toBe('playing');
    expect(getCommandIndex(skipped)).toBe(initial.remainingIds.length);
  });

  it('keeps learning mode independent of queue, timer, answers and score', () => {
    const standard = startGame(createConfig({ regionId }));
    const learning = startGame(
      createConfig({ regionId, learning: true, level: 'expert' }),
    );
    expect(learning.remainingIds).toEqual(standard.remainingIds);
    const answer = getCurrentTarget(standard).name;
    const normalResult = submitGuess(standard, answer, 1);
    const learningResult = submitGuess(learning, answer, 1);
    expect(learningResult.outcome).toBe(normalResult.outcome);
    expect(learningResult.session.guessedIds).toEqual(
      normalResult.session.guessedIds,
    );
    expect(learningResult.session.elapsedSeconds).toBe(
      normalResult.session.elapsedSeconds,
    );
    expect(learningResult.session.durationSeconds).toBe(
      regionTargets[regionId].length * 3,
    );
  });
});

describe('session lifecycle', () => {
  it.each([0, 1, 100])(
    'expiry wins before correct/wrong guess, skip or pause (%s seconds late)',
    (overtime) => {
      const initial = freezeSession(startGame(createConfig()));
      const elapsed = initial.durationSeconds + overtime;
      const correct = submitGuess(
        initial,
        getCurrentTarget(initial).name,
        elapsed,
      );
      const wrong = submitGuess(initial, 'wrong', elapsed);
      expect(correct.outcome).toBe('timeout');
      expect(wrong.outcome).toBe('timeout');
      for (const session of [
        correct.session,
        wrong.session,
        skipCountry(initial, elapsed),
        pauseGame(initial, elapsed),
      ]) {
        expect(session.phase).toBe('finished');
        expect(session.finishReason).toBe('timeout');
        expect(session.remainingIds).toBe(initial.remainingIds);
        expect(session.guessedIds).toBe(initial.guessedIds);
        expect(session.elapsedSeconds).toBe(initial.durationSeconds);
      }
    },
  );

  it('accepts an answer immediately before expiry but rejects the final correct answer at zero', () => {
    let session = startGame(
      createConfig({ regionId: 'south-america', level: 'expert' }),
    );
    while (session.remainingIds.length > 1) {
      session = submitGuess(session, getCurrentTarget(session).name, 1).session;
    }
    const answer = getCurrentTarget(session).name;
    const completed = submitGuess(
      freezeSession(session),
      answer,
      session.durationSeconds - 0.001,
    );
    expect(completed.session.finishReason).toBe('completed');
    const expired = submitGuess(
      freezeSession(session),
      answer,
      session.durationSeconds,
    );
    expect(expired.session.finishReason).toBe('timeout');
    expect(expired.session.guessedIds).toHaveLength(11);
    expect(getResults(expired.session)?.coverage).toBe(92);
  });

  it('pauses and resumes repeatedly with the exact queue and fractional active-time checkpoint', () => {
    const initial = freezeSession(startGame(createConfig()));
    const paused = freezeSession(pauseGame(initial, 5.25));
    expect(paused.phase).toBe('paused');
    expect(paused.remainingIds).toBe(initial.remainingIds);
    expect(paused.elapsedSeconds).toBe(5.25);
    const resumed = resumeGame(paused);
    expect(resumed.phase).toBe('playing');
    expect(resumed.elapsedSeconds).toBe(5.25);
    expect(getCurrentTargetId(resumed)).toBe(getCurrentTargetId(initial));
    const pausedAgain = pauseGame(resumed, 7.5);
    expect(getRemainingSeconds(pausedAgain, 100000)).toBe(532.5);
    expect(resumeGame(pausedAgain).elapsedSeconds).toBe(7.5);
  });

  it('ignores gameplay outside playing and does not finish a live unfinished round early', () => {
    const playing = freezeSession(startGame(createConfig()));
    const sessions: readonly GameSession[] = [
      createSession(createConfig()),
      pauseGame(playing, 1),
      finishGame(playing, 540),
    ];
    for (const session of sessions.map(freezeSession)) {
      expect(
        submitGuess(session, getCurrentTarget(session).name, 1000).outcome,
      ).toBe('ignored');
      expect(submitGuess(session, 'wrong').session).toBe(session);
      expect(skipCountry(session, 1000)).toBe(session);
      expect(pauseGame(session, 1000)).toBe(session);
      expect(finishGame(session, 1000)).toBe(session);
    }
    expect(finishGame(playing, 1)).toBe(playing);
    expect(resumeGame(playing)).toBe(playing);
    expect(resumeGame(sessions[0])).toBe(sessions[0]);
    expect(resumeGame(sessions[2])).toBe(sessions[2]);
  });

  it('resets progress/time to ready, retaining settings and deterministic initial order', () => {
    const initial = startGame(
      createConfig({ regionId: 'europe', learning: true, seed: 'replay' }),
    );
    const progressed = submitGuess(
      initial,
      getCurrentTarget(initial).name,
      3,
    ).session;
    const reset = resetGame(freezeSession(pauseGame(progressed, 5)));
    expect(reset).toEqual(createSession(initial.config));
    expect(reset.config).toEqual(initial.config);
    expect(reset.phase).toBe('ready');
    expect(reset.remainingIds).toEqual(initial.remainingIds);
    expect(reset.guessedIds).toEqual([]);
    expect(reset.elapsedSeconds).toBe(0);
    expect(reset.finishReason).toBeNull();
    expect(getResults(reset)).toBeNull();
  });

  it('scores coverage only, using the original whole-percentage rounding', () => {
    expect(getCoverage(37, 54)).toBe(69);
    expect(getCoverage(1, 12)).toBe(8);
    expect(getCoverage(1, 47)).toBe(2);
    expect(getCoverage(0, 0)).toBe(0);
  });
});
