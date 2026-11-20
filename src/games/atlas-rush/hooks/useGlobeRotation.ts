import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  resetCenter: () => void;
  centerOnTarget: () => void;
  stopRotation: () => void;
} => {
  const [center, setCenter] = useState<GlobeCenter>(INITIAL_CENTER);
  const [isAnimating, setIsAnimating] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const currentCenter = useRef<GlobeCenter>(INITIAL_CENTER);
  const animationFrame = useRef<number | null>(null);
  const rotationRequest = useMemo(
    () => ({ destination, resetCount }),
    [destination, resetCount],
  );
  const completedRequest = useRef<typeof rotationRequest | null>(null);

  const updateCenter = useCallback((next: GlobeCenter) => {
    currentCenter.current = next;
    setCenter(next);
  }, []);

  useEffect(() => {
    const { destination } = rotationRequest;
    if (
      !destination ||
      !isPlaying ||
      completedRequest.current === rotationRequest
    ) {
      setIsAnimating(false);
      return;
    }
    const finishRotation = () => {
      completedRequest.current = rotationRequest;
      updateCenter(destination);
      setIsAnimating(false);
    };
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    if (
      motionPreference.matches ||
      geoDistance(currentCenter.current, destination) < 1e-8
    ) {
      finishRotation();
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
      if (progress === 1) {
        animationFrame.current = null;
        finishRotation();
        return;
      }
      if (now - lastRenderedAt >= frameInterval) {
        updateCenter(interpolate(easedProgress));
        lastRenderedAt = now;
      }
      animationFrame.current = requestAnimationFrame(rotate);
    };
    const handleMotionPreferenceChange = () => {
      if (motionPreference.matches && animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
        finishRotation();
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
  }, [rotationRequest, isPlaying, updateCenter]);

  const stopRotation = () => {
    completedRequest.current = rotationRequest;
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setIsAnimating(false);
  };

  const rotateBy = (longitude: number, latitude: number) => {
    stopRotation();
    const next: GlobeCenter = [
      ((((currentCenter.current[0] + longitude) % 360) + 540) % 360) - 180,
      Math.max(-90, Math.min(90, currentCenter.current[1] + latitude)),
    ];
    updateCenter(next);
  };
  const resetCenter = () => setResetCount((previous) => previous + 1);
  const centerOnTarget = () => {
    if (destination && currentCenter.current !== destination) {
      stopRotation();
      updateCenter(destination);
    }
  };

  return {
    center,
    isAnimating,
    rotateBy,
    resetCenter,
    centerOnTarget,
    stopRotation,
  };
};
