import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import {
  Action,
  Actions,
  Controls,
  Knob,
  Stick,
  StickGroup,
} from './TouchControls.styles';

type TouchControlsProps = {
  onSteer: (x: number, y: number) => void;
  onBrake: (active: boolean) => void;
  onHyperspace: () => void;
  getHyperspaceCooldown: () => number;
  alwaysVisible?: boolean;
};

export const TouchControls: React.FC<TouchControlsProps> = ({
  onSteer,
  onBrake,
  onHyperspace,
  getHyperspaceCooldown,
  alwaysVisible = false,
}) => {
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const [cooldown, setCooldown] = useState(0);
  const stickPointer = useRef<number | null>(null);
  const brakePointer = useRef<number | null>(null);

  useEffect(() => {
    const reset = (): void => {
      stickPointer.current = null;
      brakePointer.current = null;
      setStick({ x: 0, y: 0 });
      onSteer(0, 0);
      onBrake(false);
    };
    window.addEventListener('blur', reset);
    window.addEventListener('asteroids-controls-reset', reset);
    const timer = window.setInterval(() => {
      setCooldown(getHyperspaceCooldown());
    }, 100);
    return () => {
      window.removeEventListener('blur', reset);
      window.removeEventListener('asteroids-controls-reset', reset);
      window.clearInterval(timer);
    };
  }, [getHyperspaceCooldown, onBrake, onSteer]);

  const updateStick = (event: React.PointerEvent<HTMLDivElement>): void => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const radius = bounds.width / 2;
    const x = (event.clientX - bounds.left - radius) / radius;
    const y = (event.clientY - bounds.top - radius) / radius;
    const scale = Math.max(1, Math.hypot(x, y));
    const nextStick = { x: x / scale, y: y / scale };
    setStick(nextStick);
    onSteer(nextStick.x, nextStick.y);
  };

  const handleStickDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (stickPointer.current !== null) {
      return;
    }
    stickPointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateStick(event);
  };

  const handleStickMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (stickPointer.current === event.pointerId) {
      updateStick(event);
    }
  };

  const handleStickEnd = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (stickPointer.current === event.pointerId) {
      stickPointer.current = null;
      setStick({ x: 0, y: 0 });
      onSteer(0, 0);
    }
  };

  const handleBrakeDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ): void => {
    if (brakePointer.current !== null) {
      return;
    }
    brakePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    onBrake(true);
  };

  const handleBrakeEnd = (
    event: React.PointerEvent<HTMLButtonElement>,
  ): void => {
    if (brakePointer.current === event.pointerId) {
      brakePointer.current = null;
      onBrake(false);
    }
  };

  return (
    <Controls $alwaysVisible={alwaysVisible}>
      <StickGroup>
        <Stick
          aria-label="Steering and thrust"
          onPointerDown={handleStickDown}
          onPointerMove={handleStickMove}
          onPointerUp={handleStickEnd}
          onPointerCancel={handleStickEnd}
          onLostPointerCapture={handleStickEnd}
        >
          <Knob
            style={{
              transform: `translate(${stick.x * 30}px, ${stick.y * 30}px)`,
            }}
          />
        </Stick>
        <span>Steer / thrust</span>
      </StickGroup>
      <Actions>
        <Action
          type="button"
          onPointerDown={handleBrakeDown}
          onPointerUp={handleBrakeEnd}
          onPointerCancel={handleBrakeEnd}
          onLostPointerCapture={handleBrakeEnd}
        >
          Brake
        </Action>
        <Action type="button" onClick={onHyperspace} disabled={cooldown > 0}>
          {cooldown > 0 ? `Jump ${Math.ceil(cooldown)}` : 'Jump'}
        </Action>
      </Actions>
    </Controls>
  );
};
