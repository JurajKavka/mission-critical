import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type * as React from 'react';
import { useStore } from 'zustand';
import { Tooltip } from '../../../react-component-library';
import * as UI from '../../../react-component-library/atlas-styles';
import { WORLD_TARGETS } from '../data/world-targets';
import {
  getGlobeGeometry,
  GLOBE_RADIUS,
  GLOBE_ZOOM_SCALE,
} from '../geometry/globe';
import { useGlobeRotation } from '../hooks/useGlobeRotation';
import {
  getCountryCenter,
  loadWorldGeography,
} from '../infrastructure/world-geography';
import type { WorldGeography } from '../infrastructure/world-geography';
import {
  selectCurrentTargetId,
  selectGuessedIds,
  selectLearning,
  selectPhase,
} from '../state/selectors';
import { ZoomButton } from './GameMap.styles';
import { Globe } from './WorldGlobe.styles';
import type { AtlasRushStore } from './types';

type WorldGlobeProps = {
  store: AtlasRushStore;
  onReturnFocus: () => void;
};

type TargetTooltip = {
  targetId: string;
  name: string;
  left: number;
  top: number;
};

type GlobeDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  isDragging: boolean;
};

const DRAG_THRESHOLD_PX = 5;

export const WorldGlobe: React.FC<WorldGlobeProps> = ({
  store,
  onReturnFocus,
}) => {
  const phase = useStore(store, selectPhase);
  const targetId = useStore(store, selectCurrentTargetId);
  const guessedIds = useStore(store, selectGuessedIds);
  const isLearning = useStore(store, selectLearning);
  const [geography, setGeography] = useState<WorldGeography | null>(null);
  const [hasError, setHasError] = useState(false);
  const [zoomedTargetId, setZoomedTargetId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TargetTooltip | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const globeRef = useRef<SVGSVGElement>(null);
  const drag = useRef<GlobeDrag | null>(null);
  const suppressClick = useRef(false);
  const clipId = useId();
  const isPlaying = phase === 'playing';
  const canReveal = isPlaying && isLearning;
  const isZoomed = targetId !== null && zoomedTargetId === targetId;
  const currentCountry = geography?.features.find(
    (country) => country.id === targetId,
  );
  const destination = useMemo(
    () => (currentCountry ? getCountryCenter(currentCountry) : null),
    [currentCountry],
  );
  const { center, rotateBy } = useGlobeRotation(destination, isPlaying);
  const geometry = useMemo(
    () => (geography ? getGlobeGeometry(geography, center, isZoomed) : null),
    [geography, center, isZoomed],
  );
  const targetName = WORLD_TARGETS.find(
    (country) => country.id === targetId,
  )?.name;
  const targetGeometry = geometry?.countries.find(
    (country) => country.id === targetId,
  );
  const marker = destination && geometry?.projectMarker(destination);
  const hasTargetMarker =
    isPlaying && targetGeometry !== undefined && targetGeometry.area < 45;
  const viewWidth = isZoomed ? 500 * aspectRatio : 500;
  const viewX = (500 - viewWidth) / 2;

  useEffect(() => {
    const controller = new AbortController();
    loadWorldGeography(controller.signal)
      .then((loaded) => {
        if (!controller.signal.aborted) {
          setGeography(loaded);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHasError(true);
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setTooltip(null);
    drag.current = null;
  }, [targetId, phase]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setAspectRatio(width / height);
      }
    });
    observer.observe(globe);
    return () => observer.disconnect();
  }, [geography]);

  useEffect(() => {
    if (!tooltip) {
      return;
    }
    const handleDismiss = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') {
        return;
      }
      setTooltip(null);
    };
    document.addEventListener('pointerdown', handleDismiss);
    document.addEventListener('keydown', handleDismiss);
    return () => {
      document.removeEventListener('pointerdown', handleDismiss);
      document.removeEventListener('keydown', handleDismiss);
    };
  }, [tooltip]);

  const handleZoomClick = () => {
    setZoomedTargetId(isZoomed ? null : targetId);
    onReturnFocus();
  };
  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!isPlaying || !event.isPrimary || event.button !== 0) {
      return;
    }
    suppressClick.current = false;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      isDragging: false,
    };
  };
  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const activeDrag = drag.current;
    if (!isPlaying || !activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }
    if (!activeDrag.isDragging) {
      const distance = Math.hypot(
        event.clientX - activeDrag.startX,
        event.clientY - activeDrag.startY,
      );
      if (distance < DRAG_THRESHOLD_PX) {
        return;
      }
      activeDrag.isDragging = true;
      suppressClick.current = true;
      setTooltip(null);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const { width, height } = event.currentTarget.getBoundingClientRect();
    const globeHeight = isZoomed ? height : Math.min(width, height);
    if (globeHeight > 0) {
      const degreesPerPixel =
        ((180 / Math.PI) * (500 / globeHeight)) /
        (GLOBE_RADIUS * (isZoomed ? GLOBE_ZOOM_SCALE : 1));
      rotateBy(
        -(event.clientX - activeDrag.lastX) * degreesPerPixel,
        (event.clientY - activeDrag.lastY) * degreesPerPixel,
      );
    }
    activeDrag.lastX = event.clientX;
    activeDrag.lastY = event.clientY;
  };
  const handlePointerEnd = (event: React.PointerEvent<SVGSVGElement>) => {
    if (drag.current?.pointerId === event.pointerId) {
      drag.current = null;
    }
  };
  const handleClickCapture = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.detail !== 0 && suppressClick.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick.current = false;
    }
  };
  const revealCountry = (
    element: SVGGElement,
    pointer?: { left: number; top: number },
  ) => {
    if (canReveal && targetId && targetName) {
      const bounds = element.getBoundingClientRect();
      setTooltip({
        targetId,
        name: targetName,
        left: pointer?.left ?? bounds.left + bounds.width / 2,
        top: pointer?.top ?? bounds.top,
      });
      onReturnFocus();
    }
  };
  const handleReveal = (event: React.MouseEvent<SVGGElement>) => {
    const pointer =
      event.detail === 0
        ? undefined
        : { left: event.clientX, top: event.clientY };
    revealCountry(event.currentTarget, pointer);
  };
  const handleRevealKeyDown = (event: React.KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      revealCountry(event.currentTarget);
    }
  };

  if (hasError) {
    return (
      <p role="alert">Globe could not be loaded. Please reload the page.</p>
    );
  }
  if (!geometry) {
    return <p role="status">Loading world map…</p>;
  }

  return (
    <>
      <ZoomButton
        name={isZoomed ? 'zoom-out' : 'zoom-in'}
        label={isZoomed ? 'Reset globe zoom' : 'Zoom in on highlighted country'}
        pressed={isZoomed}
        disabled={!isPlaying || targetId === null}
        onClick={handleZoomClick}
      />
      <Globe
        ref={globeRef}
        $draggable={isPlaying}
        viewBox={`${viewX} 0 ${viewWidth} 500`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        onClickCapture={handleClickCapture}
        role={canReveal ? 'group' : 'img'}
        aria-label={`World globe. Drag to rotate. Identify the highlighted country.${canReveal ? ' Select the highlighted country to reveal its name.' : ''}`}
      >
        <defs>
          <radialGradient id={`${clipId}-ocean`} cx="35%" cy="30%" r="75%">
            <stop className="globe-ocean-core" offset="0%" />
            <stop className="globe-ocean-edge" offset="100%" />
          </radialGradient>
          <clipPath id={clipId}>
            <rect x={viewX} width={viewWidth} height="500" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path
            className="globe-ocean"
            fill={`url(#${clipId}-ocean)`}
            d={geometry.ocean}
          />
          <path className="globe-grid" d={geometry.grid} />
          {[
            ...geometry.countries.filter((country) => country.id !== targetId),
            ...geometry.countries.filter((country) => country.id === targetId),
          ].map((country) => {
            const isTarget = isPlaying && country.id === targetId;
            const canSelect = canReveal && isTarget;
            return (
              <g
                key={country.id}
                role={canSelect ? 'button' : undefined}
                tabIndex={canSelect ? 0 : undefined}
                aria-label={canSelect ? 'Reveal the name' : undefined}
                onClick={canSelect ? handleReveal : undefined}
                onKeyDown={canSelect ? handleRevealKeyDown : undefined}
              >
                <UI.Country
                  d={country.path}
                  data-country={country.id}
                  data-target={isTarget}
                  data-guessed={guessedIds.includes(country.id)}
                  vectorEffect="non-scaling-stroke"
                />
                {isTarget && hasTargetMarker && marker && (
                  <>
                    <circle
                      className="globe-marker-ring"
                      cx={marker[0]}
                      cy={marker[1]}
                      r="10"
                    />
                    <circle
                      className="globe-marker"
                      cx={marker[0]}
                      cy={marker[1]}
                      r="4"
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>
      </Globe>
      {tooltip && canReveal && tooltip.targetId === targetId && (
        <Tooltip name={tooltip.name} left={tooltip.left} top={tooltip.top} />
      )}
    </>
  );
};
