import { useEffect, useRef, useState } from 'react';
import { geoInterpolate } from 'd3-geo';
import type { GlobeCenter } from '../infrastructure/world-geography';

const INITIAL_CENTER: GlobeCenter = [15, 15];
const ROTATION_DURATION_MS = 1100;

export const useGlobeRotation = (
  destination: GlobeCenter | null,
  isPlaying: boolean,
): GlobeCenter => {
  const [center, setCenter] = useState<GlobeCenter>(INITIAL_CENTER);
  const currentCenter = useRef<GlobeCenter>(INITIAL_CENTER);

  useEffect(() => {
    if (!destination || !isPlaying) {
      return;
    }
    const updateCenter = (next: GlobeCenter) => {
      currentCenter.current = next;
      setCenter(next);
    };
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    if (motionPreference.matches) {
      updateCenter(destination);
      return;
    }
    const interpolate = geoInterpolate(currentCenter.current, destination);
    const startedAt = performance.now();
    let frameId = 0;
    const rotate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / ROTATION_DURATION_MS);
      const easedProgress = progress * progress * (3 - 2 * progress);
      updateCenter(interpolate(easedProgress));
      if (progress < 1) {
        frameId = requestAnimationFrame(rotate);
      }
    };
    const handleMotionPreferenceChange = () => {
      if (motionPreference.matches) {
        cancelAnimationFrame(frameId);
        updateCenter(destination);
      }
    };
    motionPreference.addEventListener('change', handleMotionPreferenceChange);
    frameId = requestAnimationFrame(rotate);
    return () => {
      cancelAnimationFrame(frameId);
      motionPreference.removeEventListener(
        'change',
        handleMotionPreferenceChange,
      );
    };
  }, [destination, isPlaying]);

  return center;
};
