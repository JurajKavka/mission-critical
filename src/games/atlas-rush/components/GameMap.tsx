import { useEffect, useId, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type * as React from 'react';
import { IconButton, Tooltip } from '../../../react-component-library';
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
import * as UI from '../../../react-component-library/atlas-styles';
import styles from './GameMap.module.css';
import { getDetailViewBox } from './map-zoom';
import type { AtlasRushStore } from './types';

type GameMapProps = {
  store: AtlasRushStore;
  regionId: RegionId;
  onReturnFocus: () => void;
};

const RUSSIA_CROP_TOP: Partial<Record<RegionId, number>> = {
  asia: 13,
  europe: 11.6,
};

const getVisibleTargetBounds = (
  target: SVGPathElement,
  regionId: RegionId,
  targetId: string | null,
) => {
  const bounds = target.getBBox();
  const cropTop = RUSSIA_CROP_TOP[regionId];
  if (targetId !== 'RUS' || cropTop === undefined) {
    return bounds;
  }

  const y = Math.max(bounds.y, cropTop);
  return {
    x: bounds.x,
    y,
    width: bounds.width,
    height: Math.max(0, bounds.y + bounds.height - y),
  };
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
  const [zoom, setZoom] = useState<{
    regionId: RegionId;
    targetId: string;
    viewBox: string;
  } | null>(null);
  const mapRef = useRef<SVGSVGElement>(null);
  const clipId = useId();
  const russiaClipId = useId();
  const isPointerFocusing = useRef(false);
  const region = regionMetadata[regionId];
  const activeZoom =
    zoom?.regionId === regionId && zoom.targetId === targetId ? zoom : null;
  const isZoomed = activeZoom !== null;

  useEffect(() => {
    setTooltip(null);
  }, [targetId, phase]);

  useEffect(() => {
    setZoom(null);
  }, [targetId, regionId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isZoomed || !map || !geography) {
      return;
    }
    const updateDetailView = () => {
      const target = map.querySelector<SVGPathElement>('[data-target="true"]');
      const { width, height } = map.getBoundingClientRect();
      if (target && width > 0 && height > 0) {
        const viewBox = getDetailViewBox(
          geography.viewBox,
          getVisibleTargetBounds(target, regionId, targetId),
          width / height,
        );
        setZoom((previous) => {
          if (
            !previous ||
            previous.regionId !== regionId ||
            previous.targetId !== targetId
          ) {
            return previous;
          }
          return { ...previous, viewBox };
        });
      }
    };
    const observer = new ResizeObserver(updateDetailView);
    observer.observe(map);
    return () => observer.disconnect();
  }, [geography, isZoomed, regionId, targetId]);

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
  const currentViewBox = activeZoom?.viewBox ?? geography.viewBox;
  const [clipX, clipY, clipWidth, clipHeight] = currentViewBox
    .split(' ')
    .map(Number);
  const handleZoomButtonClick = () => {
    if (activeZoom) {
      setZoom(null);
    } else {
      const target = mapRef.current?.querySelector<SVGPathElement>(
        '[data-target="true"]',
      );
      const bounds = mapRef.current?.getBoundingClientRect();
      if (
        target &&
        targetId &&
        bounds &&
        bounds.width > 0 &&
        bounds.height > 0
      ) {
        setZoom({
          regionId,
          targetId,
          viewBox: getDetailViewBox(
            geography.viewBox,
            getVisibleTargetBounds(target, regionId, targetId),
            bounds.width / bounds.height,
          ),
        });
      }
    }
    onReturnFocus();
  };
  return (
    <>
      <IconButton
        className={styles.zoomButton}
        name={isZoomed ? 'zoom-out' : 'zoom-in'}
        label={isZoomed ? 'Reset map zoom' : 'Zoom in on highlighted area'}
        pressed={isZoomed}
        disabled={phase !== 'playing' || targetId === null}
        onClick={handleZoomButtonClick}
      />
      <UI.Map
        ref={mapRef}
        viewBox={currentViewBox}
        role={canReveal ? 'group' : 'img'}
        aria-label={`${region.name} map. ${canReveal ? `Select the highlighted ${region.targetName} to reveal its name.` : `Identify the highlighted ${region.targetName}.`}`}
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <rect x={clipX} y={clipY} width={clipWidth} height={clipHeight} />
          </clipPath>
          {regionId === 'europe' && (
            <clipPath id={russiaClipId} clipPathUnits="userSpaceOnUse">
              <rect x="0" y={RUSSIA_CROP_TOP.europe} width="62" height="41" />
            </clipPath>
          )}
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {geography.countries.map((country) => {
            const isTarget = phase === 'playing' && country.id === targetId;
            const canSelect = canReveal && isTarget;
            return (
              <UI.Country
                key={country.id}
                d={country.path}
                clipPath={
                  regionId === 'europe' && country.id === 'RUS'
                    ? `url(#${russiaClipId})`
                    : undefined
                }
                data-country={country.id}
                data-learning-target={canSelect ? '' : undefined}
                vectorEffect="non-scaling-stroke"
                data-target={isTarget}
                data-guessed={guessed.includes(country.id)}
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
        </g>
      </UI.Map>
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
