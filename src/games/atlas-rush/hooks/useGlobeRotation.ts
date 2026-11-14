import { useEffect, useRef, useState } from 'react';
import { geoDistance, geoInterpolate } from 'd3-geo';
import type { GlobeCenter } from '../infrastructure/world-geography';

const INITIAL_CENTER: GlobeCenter = [15, 15];
const ROTATION_DURATION_MS = 1100;
const MOBILE_ROTATION_INTERVAL_MS = 1000 / 30 - 1;
const MOBILE_POINTER_QUERY = '(pointer: coarse) and (max-width: 1024px)';

export const useGlobeRotation = (
  destination: GlobeCenter | null,
  isPlaying: boolean,
): {
  center: GlobeCenter;
  isAnimating: boolean;
  rotateBy: (longitude: number, latitude: number) => void;
} => {
  const [center, setCenter] = useState<GlobeCenter>(INITIAL_CENTER);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentCenter = useRef<GlobeCenter>(INITIAL_CENTER);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!destination || !isPlaying) {
      setIsAnimating(false);
      return;
    }
    const updateCenter = (next: GlobeCenter) => {
      currentCenter.current = next;
      setCenter(next);
    };
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    if (
      motionPreference.matches ||
      geoDistance(currentCenter.current, destination) < 1e-8
    ) {
      setIsAnimating(false);
      updateCenter(destination);
      return;
    }
    setIsAnimating(true);
    const frameInterval = window.matchMedia(MOBILE_POINTER_QUERY).matches
      ? MOBILE_ROTATION_INTERVAL_MS
      : 0;
    let lastRenderedAt = -Infinity;
    const interpolate = geoInterpolate(currentCenter.current, destination);
    const startedAt = performance.now();
    const rotate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / ROTATION_DURATION_MS);
      const easedProgress = progress * progress * (3 - 2 * progress);
      if (progress === 1 || now - lastRenderedAt >= frameInterval) {
        updateCenter(interpolate(easedProgress));
        lastRenderedAt = now;
      }
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(rotate);
      } else {
        animationFrame.current = null;
        setIsAnimating(false);
      }
    };
    const handleMotionPreferenceChange = () => {
      if (motionPreference.matches) {
        if (animationFrame.current !== null) {
          cancelAnimationFrame(animationFrame.current);
          animationFrame.current = null;
        }
        updateCenter(destination);
        setIsAnimating(false);
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
    setIsAnimating(false);
    const next: GlobeCenter = [
      ((((currentCenter.current[0] + longitude) % 360) + 540) % 360) - 180,
      Math.max(-90, Math.min(90, currentCenter.current[1] + latitude)),
    ];
    currentCenter.current = next;
    setCenter(next);
  };

  return { center, isAnimating, rotateBy };
};
