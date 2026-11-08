const VIEWPORT_INSET = 8;
const POINTER_OFFSET = 12;

type TooltipPosition = { left: number; top: number };
type TooltipSize = { width: number; height: number };

export const getTooltipPosition = (
  anchor: TooltipPosition,
  tooltip: TooltipSize,
  viewport: TooltipSize,
): TooltipPosition => {
  const maximumLeft = Math.max(
    VIEWPORT_INSET,
    viewport.width - tooltip.width - VIEWPORT_INSET,
  );
  const maximumTop = Math.max(
    VIEWPORT_INSET,
    viewport.height - tooltip.height - VIEWPORT_INSET,
  );
  const preferredLeft = anchor.left + POINTER_OFFSET;
  const preferredTop = anchor.top + POINTER_OFFSET;
  const top =
    preferredTop > maximumTop
      ? anchor.top - tooltip.height - POINTER_OFFSET
      : preferredTop;

  return {
    left: Math.max(VIEWPORT_INSET, Math.min(preferredLeft, maximumLeft)),
    top: Math.max(VIEWPORT_INSET, Math.min(top, maximumTop)),
  };
};
