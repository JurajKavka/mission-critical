import type * as React from 'react';
import { ICONS } from './icons';

export const ICON_SIZE_MAPPING = {
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 56,
} as const;

export type IconName = keyof typeof ICONS;
export type IconSize = keyof typeof ICON_SIZE_MAPPING | number;

export type IconProps = {
  name: IconName;
  size?: IconSize;
  color?: string;
  className?: string;
  title?: string;
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'm',
  color,
  className,
  title,
}) => {
  const IconShape = ICONS[name];
  const sizeInPixels =
    typeof size === 'number' ? size : ICON_SIZE_MAPPING[size];

  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      className={className}
      color={color}
      fill="none"
      height={sizeInPixels}
      role={title ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width={sizeInPixels}
    >
      <IconShape />
    </svg>
  );
};
