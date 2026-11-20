import { useEffect, useEffectEvent } from 'react';
import type { RefObject } from 'react';

const WHEEL_LINE_HEIGHT = 16;
const WHEEL_ZOOM_SENSITIVITY = 0.002;

export const useWheelZoom = (
  svgRef: RefObject<SVGSVGElement | null>,
  isEnabled: boolean,
  onZoom: (factor: number, svg: SVGSVGElement) => boolean,
) => {
  const applyZoom = useEffectEvent(onZoom);

  useEffect(() => {
    const svg = svgRef.current;
    if (!isEnabled || !svg) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const { deltaMode, deltaY } = event;
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        !Number.isFinite(deltaY) ||
        deltaY === 0
      ) {
        return;
      }

      let pixels = deltaY;
      if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
        pixels *= WHEEL_LINE_HEIGHT;
      } else if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        pixels *= svg.clientHeight;
      }
      const factor = Math.exp(-pixels * WHEEL_ZOOM_SENSITIVITY);
      if (applyZoom(factor, svg)) {
        event.preventDefault();
      }
    };
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [svgRef, isEnabled]);
};
