import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type * as React from 'react';
import { Tooltip } from '../../../react-component-library';
import { regionMetadata } from '../data/regions';
import type { RegionId } from '../domain/types';
import { loadGeography } from '../infrastructure/geography';
import type { Geography } from '../infrastructure/geography';
import {
  selectCurrentTargetId,
  selectGuessedIds,
  selectLearning,
  selectPhase,
} from '../state/selectors';
import styles from './AtlasRush.module.css';
import type { AtlasRushStore } from './types';

type GameMapProps = {
  store: AtlasRushStore;
  regionId: RegionId;
  onReturnFocus: () => void;
};

export const GameMap: React.FC<GameMapProps> = ({
  store,
  regionId,
  onReturnFocus,
}) => {
  const phase = useStore(store, selectPhase);
  const targetId = useStore(store, selectCurrentTargetId);
  const guessed = useStore(store, selectGuessedIds);
  const learning = useStore(store, selectLearning);
  const [geography, setGeography] = useState<Geography | null>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    left: number;
    top: number;
  } | null>(null);
  const [error, setError] = useState(false);
  const isPointerFocusing = useRef(false);
  const region = regionMetadata[regionId];

  useEffect(() => {
    setTooltip(null);
  }, [targetId, phase]);

  useEffect(() => {
    let active = true;
    loadGeography(regionId)
      .then((loaded) => {
        if (active) {
          setGeography(loaded);
          setError(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [regionId]);

  useEffect(() => {
    const hide = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.matches('[data-learning-target]')
      ) {
        setTooltip(null);
      }
    };
    const hideOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTooltip(null);
      }
    };
    const resetPointerFocus = () => {
      isPointerFocusing.current = false;
    };
    document.addEventListener('pointerdown', hide);
    document.addEventListener('pointerup', resetPointerFocus);
    document.addEventListener('pointercancel', resetPointerFocus);
    document.addEventListener('keydown', hideOnEscape);
    return () => {
      document.removeEventListener('pointerdown', hide);
      document.removeEventListener('pointerup', resetPointerFocus);
      document.removeEventListener('pointercancel', resetPointerFocus);
      document.removeEventListener('keydown', hideOnEscape);
    };
  }, []);

  const showAtTarget = (name: string, element: SVGPathElement) => {
    const bounds = element.getBoundingClientRect();
    setTooltip({
      name,
      left: bounds.left + bounds.width / 2,
      top: bounds.top,
    });
  };
  if (error) {
    return <p role="alert">Map could not be loaded. Please reload the page.</p>;
  }
  if (!geography) {
    return <p role="status">Loading map…</p>;
  }
  const canReveal = phase === 'playing' && learning;
  return (
    <>
      <svg
        className={styles.map}
        viewBox={geography.viewBox}
        role={canReveal ? 'group' : 'img'}
        aria-label={`${region.name} map. ${canReveal ? `Select the highlighted ${region.targetName} to reveal its name.` : `Identify the highlighted ${region.targetName}.`}`}
      >
        {geography.countries.map((country) => {
          const isTarget = phase === 'playing' && country.id === targetId;
          const canSelect = canReveal && isTarget;
          return (
            <path
              key={country.id}
              d={country.path}
              data-country={country.id}
              data-learning-target={canSelect ? '' : undefined}
              vectorEffect="non-scaling-stroke"
              className={`${styles.country} ${isTarget ? styles.target : ''} ${guessed.includes(country.id) ? styles.guessed : ''}`}
              tabIndex={canSelect ? 0 : undefined}
              role={canSelect ? 'button' : undefined}
              aria-label={canSelect ? 'Reveal the name' : undefined}
              onPointerDown={
                canSelect
                  ? () => {
                      isPointerFocusing.current = true;
                    }
                  : undefined
              }
              onFocus={
                canSelect
                  ? (event) => {
                      if (!isPointerFocusing.current) {
                        showAtTarget(country.name, event.currentTarget);
                      }
                    }
                  : undefined
              }
              onClick={
                canSelect
                  ? (event) => {
                      if (event.detail === 0) {
                        showAtTarget(country.name, event.currentTarget);
                      } else {
                        setTooltip({
                          name: country.name,
                          left: event.clientX,
                          top: event.clientY,
                        });
                      }
                      onReturnFocus();
                    }
                  : undefined
              }
              onPointerMove={
                canSelect && tooltip?.name === country.name
                  ? (event) => {
                      if (event.pointerType === 'mouse') {
                        setTooltip({
                          name: country.name,
                          left: event.clientX,
                          top: event.clientY,
                        });
                      }
                    }
                  : undefined
              }
              onKeyDown={
                canSelect
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        showAtTarget(country.name, event.currentTarget);
                      }
                    }
                  : undefined
              }
            />
          );
        })}
      </svg>
      {tooltip &&
        canReveal &&
        geography.countries.some(
          (country) => country.id === targetId && country.name === tooltip.name,
        ) && (
          <Tooltip name={tooltip.name} left={tooltip.left} top={tooltip.top} />
        )}
    </>
  );
};
