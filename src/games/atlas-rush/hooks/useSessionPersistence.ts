import { useEffect, useRef, useState } from 'react';
import type { ChallengeConfig } from '../domain/types';
import {
  createRandomSeed,
  replaceCurrentChallenge,
} from '../infrastructure/browser-url';
import { parseChallengeQuery } from '../infrastructure/challenge-url';
import { openSessionDatabase } from '../infrastructure/persistence/database';
import type { SessionDatabase } from '../infrastructure/persistence/database';
import { createSessionRepository } from '../infrastructure/persistence/session-repository';
import {
  captureSnapshot,
  getChallengeIdentity,
  isValidRecord,
} from '../infrastructure/persistence/snapshot';
import { loadGeography } from '../infrastructure/geography';
import type { AtlasRushStore } from '../components/types';

type Initialization = 'loading' | 'choose' | 'ready';
type Controller = {
  continueGame: () => Promise<void>;
  startNew: () => Promise<void>;
  discard: () => Promise<boolean>;
  fallback: () => void;
};

type SessionPersistence = {
  readonly initialization: Initialization;
  readonly notice: string;
  readonly canContinue: boolean;
  readonly continueGame: () => void;
  readonly startNew: () => void;
  readonly discard: () => Promise<boolean>;
};

export const useSessionPersistence = (
  store: AtlasRushStore,
  regionId: ChallengeConfig['regionId'],
): SessionPersistence => {
  const [initialization, setInitialization] =
    useState<Initialization>('loading');
  const [notice, setNotice] = useState('');
  const [canContinue, setCanContinue] = useState(false);
  const controller = useRef<Controller | null>(null);

  useEffect(() => {
    let cancelled = false;
    let database: SessionDatabase | null = null;
    let unsubscribe: (() => void) | null = null;
    let generation: string | null = null;
    let revision = 0;
    let queue: Promise<void> = Promise.resolve();
    let saving = false;
    let automaticPause = false;
    const config = parseChallengeQuery(regionId, window.location.search);
    const key = getChallengeIdentity(config.config);
    const warn = (message: string) => {
      if (!cancelled) {
        setNotice(message);
      }
    };
    if (config.corrected) {
      replaceCurrentChallenge(config.config);
    }

    const pauseIfHidden = () => {
      if (
        document.visibilityState === 'hidden' &&
        store.getState().session.phase === 'playing'
      ) {
        automaticPause = true;
        store.getState().pauseGame();
      }
    };

    const startMemoryGame = () => {
      generation = null;
      if (!cancelled) {
        store.getState().startGame(config.config);
        pauseIfHidden();
        setInitialization('ready');
      }
    };

    const initialize = async () => {
      try {
        await loadGeography(regionId);
        if (cancelled) {
          return;
        }
        database = await openSessionDatabase();
        if (cancelled) {
          database.close();
          return;
        }
        const repository = createSessionRepository(database);
        let expected = await repository.load(key);
        if (cancelled) {
          return;
        }

        const setupSaving = (token: string) => {
          generation = token;
          revision = 0;
          saving = true;
          unsubscribe?.();
          unsubscribe = store.subscribe((state, previous) => {
            if (
              state.session === previous.session ||
              !saving ||
              state.session.phase === 'ready'
            ) {
              return;
            }
            const snapshot = captureSnapshot(state.session);
            revision += 1;
            const nextRevision = revision;
            queue = queue
              .then(async () => {
                if (!saving) {
                  return;
                }
                const saved = await repository.save(
                  key,
                  token,
                  nextRevision,
                  snapshot,
                );
                if (!saved) {
                  saving = false;
                  warn(
                    'This challenge is being saved in another tab. Your current game continues without saving.',
                  );
                }
              })
              .catch(() => {
                saving = false;
                warn('Progress could not be saved. Your game can continue.');
              });
          });
        };

        const claim = async (continueSaved: boolean): Promise<void> => {
          if (cancelled) {
            return;
          }
          const inspected = expected;
          const valid = isValidRecord(inspected, config.config);
          const saved = valid ? inspected.snapshot : null;
          if (continueSaved && (!saved || saved.phase === 'finished')) {
            warn('The saved game changed. Choose a new game.');
            setCanContinue(false);
            setInitialization('choose');
            return;
          }
          const token = createRandomSeed();
          const claimed = await repository.claim(
            key,
            expected,
            token,
            continueSaved ? saved : null,
          );
          if (cancelled) {
            return;
          }
          if (!claimed) {
            expected = await repository.load(key);
            const latest = expected;
            const latestValid = isValidRecord(latest, config.config);
            setCanContinue(
              Boolean(
                latestValid &&
                latest.snapshot &&
                latest.snapshot.phase !== 'finished',
              ),
            );
            warn('The saved game changed in another tab. Please choose again.');
            setInitialization('choose');
            return;
          }
          if (continueSaved && saved) {
            if (!store.getState().restoreGame(saved)) {
              warn('The saved game is invalid. Starting a new game.');
              setupSaving(token);
              store.getState().startGame(config.config);
            } else {
              setupSaving(token);
              store.getState().resumeGame();
            }
          } else {
            setupSaving(token);
            store.getState().startGame(config.config);
          }
          pauseIfHidden();
          setInitialization('ready');
        };

        controller.current = {
          continueGame: () => claim(true),
          startNew: () => claim(false),
          fallback: startMemoryGame,
          discard: async () => {
            saving = false;
            unsubscribe?.();
            await queue;
            if (!generation) {
              return true;
            }
            try {
              const discarded = await repository.discard(
                key,
                generation,
                createRandomSeed(),
              );
              if (!discarded) {
                warn('Another tab owns the saved game; it was not removed.');
              }
              generation = null;
              return true;
            } catch {
              warn(
                'The previous save could not be removed. Select End game again to leave.',
              );
              generation = null;
              return false;
            }
          },
        };
        const inspected = expected;
        const valid = isValidRecord(inspected, config.config);
        if (
          valid &&
          inspected.snapshot &&
          inspected.snapshot.phase !== 'finished'
        ) {
          setCanContinue(true);
          setInitialization('choose');
        } else if (expected !== undefined && !valid) {
          warn('The saved game cannot be restored. Start a new game.');
          setInitialization('choose');
        } else {
          await claim(false);
        }
      } catch {
        warn('Storage is unavailable. Your game can continue without saving.');
        startMemoryGame();
      }
    };
    void initialize();

    const handleVisibility = () => {
      if (
        document.visibilityState === 'hidden' &&
        store.getState().session.phase === 'playing'
      ) {
        automaticPause = true;
        store.getState().pauseGame();
      } else if (document.visibilityState === 'visible' && automaticPause) {
        automaticPause = false;
        if (store.getState().session.phase === 'paused') {
          store.getState().resumeGame();
        }
      }
    };
    const handlePageHide = () => {
      if (store.getState().session.phase === 'playing') {
        store.getState().pauseGame();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      cancelled = true;
      controller.current = null;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      unsubscribe?.();
      void queue.finally(() => database?.close());
    };
  }, [regionId, store]);

  const run = (action: 'continueGame' | 'startNew') => {
    const selected = controller.current;
    if (!selected) {
      return;
    }
    setInitialization('loading');
    void selected[action]().catch(() => {
      setNotice(
        'Storage is unavailable. Your game can continue without saving.',
      );
      selected.fallback();
    });
  };
  return {
    initialization,
    notice,
    canContinue,
    continueGame: () => run('continueGame'),
    startNew: () => run('startNew'),
    discard: async () =>
      controller.current ? controller.current.discard() : true,
  };
};
