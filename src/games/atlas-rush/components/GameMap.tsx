import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type * as React from 'react';
import { Tooltip } from '../../../react-component-library';
import { regionMetadata } from '../data/regions';
import type { RegionId } from '../domain/types';
import { useWheelZoom } from '../hooks/useWheelZoom';
import { loadGeography } from '../infrastructure/geography';
import type { Geography } from '../infrastructure/geography';
import {
  selectCurrentTargetId,
  selectGuessedIds,
  selectLearning,
  selectPhase,
} from '../state/selectors';
import * as UI from '../../../react-component-library/atlas-styles';
import { ZoomButton, ZoomControls } from './GameMap.styles';
import {
  getDetailMapBounds,
  getWheelMapBounds,
  parseMapBounds,
} from './map-zoom';
import type { MapBounds } from './map-zoom';
import type { AtlasRushStore } from './types';

type GameMapProps = {
  store: AtlasRushStore;
  regionId: RegionId;
  onReturnFocus: () => void;
};

type MapZoom = {
  mode: 'target' | 'wheel';
  regionId: RegionId;
  targetId: string;
  bounds: MapBounds;
};

type MapLoadResult = {
  regionId: RegionId;
  geography: Geography | null;
};

const ASIA_RUSSIA_CROP_TOP = 13;

const getVisibleTargetBounds = (
  target: SVGPathElement,
  regionId: RegionId,
  targetId: string | null,
) => {
  const bounds = target.getBBox();
  if (targetId !== 'RUS' || regionId !== 'asia') {
    return bounds;
  }

  const y = Math.max(bounds.y, ASIA_RUSSIA_CROP_TOP);
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
  const [loadResult, setLoadResult] = useState<MapLoadResult | null>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    left: number;
    top: number;
  } | null>(null);
  const [zoom, setZoom] = useState<MapZoom | null>(null);
  const mapRef = useRef<SVGSVGElement>(null);
  const clipId = useId();
  const isPointerFocusing = useRef(false);
  const region = regionMetadata[regionId];
  const activeLoad = loadResult?.regionId === regionId ? loadResult : null;
  const geography = activeLoad?.geography;
  const activeZoom =
    zoom?.regionId === regionId && zoom.targetId === targetId ? zoom : null;
  const isTargetZoomed = activeZoom?.mode === 'target';
  const canZoom = phase === 'playing' && targetId !== null;
  const fullBounds = useMemo(
    () => (geography ? parseMapBounds(geography.viewBox) : null),
    [geography],
  );
  const currentBounds = activeZoom?.bounds ?? fullBounds;

  useEffect(() => {
    setTooltip(null);
  }, [targetId, phase, currentBounds]);

  useEffect(() => {
    setZoom(null);
  }, [targetId, regionId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!canZoom || !isTargetZoomed || !map || !fullBounds) {
      return;
    }
    const updateDetailView = () => {
      const target = map.querySelector<SVGPathElement>('[data-target="true"]');
      const { width, height } = map.getBoundingClientRect();
      if (target && width > 0 && height > 0) {
        const bounds = getDetailMapBounds(
          fullBounds,
          getVisibleTargetBounds(target, regionId, targetId),
          width / height,
        );
        setZoom((previous) => {
          if (
            previous?.mode !== 'target' ||
            previous.regionId !== regionId ||
            previous.targetId !== targetId
          ) {
            return previous;
          }
          return { ...previous, bounds };
        });
      }
    };
    const observer = new ResizeObserver(updateDetailView);
    observer.observe(map);
    return () => observer.disconnect();
  }, [canZoom, fullBounds, isTargetZoomed, regionId, targetId]);

  useEffect(() => {
    let active = true;
    loadGeography(regionId)
      .then((loaded) => {
        if (active) {
          setLoadResult({ regionId, geography: loaded });
        }
      })
      .catch(() => {
        if (active) {
          setLoadResult({ regionId, geography: null });
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

  const handleWheelZoom = (factor: number, map: SVGSVGElement) => {
    if (!canZoom || !fullBounds || targetId === null) {
      return false;
    }
    const target = map.querySelector<SVGPathElement>('[data-target="true"]');
    const viewport = map.getBoundingClientRect();
    if (!target || viewport.width <= 0 || viewport.height <= 0) {
      return false;
    }
    const targetBounds = getVisibleTargetBounds(target, regionId, targetId);
    setZoom((previous) => {
      const current =
        previous?.regionId === regionId && previous.targetId === targetId
          ? previous.bounds
          : fullBounds;
      const bounds = getWheelMapBounds(
        fullBounds,
        current,
        viewport,
        targetBounds,
        factor,
      );
      if (bounds === fullBounds) {
        return null;
      }
      if (previous?.mode === 'wheel' && bounds === previous.bounds) {
        return previous;
      }
      return { mode: 'wheel', regionId, targetId, bounds };
    });
    return true;
  };
  useWheelZoom(mapRef, canZoom && fullBounds !== null, handleWheelZoom);

  const showAtTarget = (name: string, element: SVGPathElement) => {
    const bounds = element.getBoundingClientRect();
    setTooltip({
      name,
      left: bounds.left + bounds.width / 2,
      top: bounds.top,
    });
  };
  if (activeLoad && !geography) {
    return <p role="alert">Map could not be loaded. Please reload the page.</p>;
  }
  if (!geography || !fullBounds || !currentBounds) {
    return <p role="status">Loading map…</p>;
  }
  const canReveal = phase === 'playing' && learning;
  const { x, y, width, height } = currentBounds;
  const handleResetClick = () => {
    setZoom(null);
    onReturnFocus();
  };
  const handleZoomButtonClick = () => {
    if (isTargetZoomed) {
      handleResetClick();
      return;
    }
    const target = mapRef.current?.querySelector<SVGPathElement>(
      '[data-target="true"]',
    );
    const viewport = mapRef.current?.getBoundingClientRect();
    if (
      target &&
      targetId &&
      viewport &&
      viewport.width > 0 &&
      viewport.height > 0
    ) {
      setZoom({
        mode: 'target',
        regionId,
        targetId,
        bounds: getDetailMapBounds(
          fullBounds,
          getVisibleTargetBounds(target, regionId, targetId),
          viewport.width / viewport.height,
        ),
      });
    }
    onReturnFocus();
  };
  return (
    <>
      <ZoomControls>
        {activeZoom?.mode === 'wheel' && (
          <ZoomButton
            name="reset-view"
            label="Reset map view"
            disabled={!canZoom}
            onClick={handleResetClick}
          />
        )}
        <ZoomButton
          name={isTargetZoomed ? 'zoom-out' : 'zoom-in'}
          label={
            isTargetZoomed ? 'Reset map zoom' : 'Zoom in on highlighted area'
          }
          pressed={isTargetZoomed}
          disabled={!canZoom}
          onClick={handleZoomButtonClick}
        />
      </ZoomControls>
      <UI.Map
        ref={mapRef}
        viewBox={`${x} ${y} ${width} ${height}`}
        role={canReveal ? 'group' : 'img'}
        aria-label={`${region.name} map. ${canReveal ? `Select the highlighted ${region.targetName} to reveal its name.` : `Identify the highlighted ${region.targetName}.`}`}
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <rect x={x} y={y} width={width} height={height} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {geography.countries.map((country) => {
            const isTarget = phase === 'playing' && country.id === targetId;
            const canSelect = canReveal && isTarget;
            return (
              <UI.Country
                key={country.id}
                d={country.path}
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
