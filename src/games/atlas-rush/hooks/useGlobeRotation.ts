import { useEffect, useRef, useState } from 'react';
import { geoInterpolate } from 'd3-geo';
import type { GlobeCenter } from '../infrastructure/world-geography';

const INITIAL_CENTER: GlobeCenter = [15, 15];
const ROTATION_DURATION_MS = 1100;

export const useGlobeRotation = (
  destination: GlobeCenter | null,
  isPlaying: boolean,
): {
  center: GlobeCenter;
  rotateBy: (longitude: number, latitude: number) => void;
} => {
  const [center, setCenter] = useState<GlobeCenter>(INITIAL_CENTER);
  const currentCenter = useRef<GlobeCenter>(INITIAL_CENTER);
  const animationFrame = useRef<number | null>(null);

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
    const rotate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / ROTATION_DURATION_MS);
      const easedProgress = progress * progress * (3 - 2 * progress);
      updateCenter(interpolate(easedProgress));
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(rotate);
      } else {
        animationFrame.current = null;
      }
    };
    const handleMotionPreferenceChange = () => {
      if (motionPreference.matches) {
        if (animationFrame.current !== null) {
          cancelAnimationFrame(animationFrame.current);
          animationFrame.current = null;
        }
        updateCenter(destination);
      }
    };
    motionPreference.addEventListener('change', handleMotionPreferenceChange);
    animationFrame.current = requestAnimationFrame(rotate);
    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      motionPreference.removeEventListener(
        'change',
        handleMotionPreferenceChange,
      );
    };
  }, [destination, isPlaying]);

  const rotateBy = (longitude: number, latitude: number) => {
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    const next: GlobeCenter = [
      ((((currentCenter.current[0] + longitude) % 360) + 540) % 360) - 180,
      Math.max(-90, Math.min(90, currentCenter.current[1] + latitude)),
    ];
    currentCenter.current = next;
    setCenter(next);
  };

  return { center, rotateBy };
};
