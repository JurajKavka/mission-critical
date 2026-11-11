import { useCallback, useEffect, useRef } from 'react';
import type * as React from 'react';
import { TouchControls } from './TouchControls';

const steer = (x: number, y: number): void => {
  window.dispatchEvent(
    new CustomEvent('asteroids-steer', { detail: { x, y } }),
  );
};

const brake = (active: boolean): void => {
  window.dispatchEvent(new CustomEvent('asteroids-brake', { detail: active }));
};

const hyperspace = (): void => {
  window.dispatchEvent(new Event('asteroids-hyperspace'));
};

export const AsteroidsTouchControls: React.FC = () => {
  const cooldown = useRef(0);

  useEffect(() => {
    const updateCooldown = (event: Event): void => {
      cooldown.current = (event as CustomEvent<number>).detail;
    };
    window.addEventListener('asteroids-cooldown', updateCooldown);
    return () =>
      window.removeEventListener('asteroids-cooldown', updateCooldown);
  }, []);

  const getHyperspaceCooldown = useCallback(() => cooldown.current, []);

  return (
    <TouchControls
      onSteer={steer}
      onBrake={brake}
      onHyperspace={hyperspace}
      getHyperspaceCooldown={getHyperspaceCooldown}
    />
  );
};
