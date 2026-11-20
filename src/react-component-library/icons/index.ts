import { Exit } from './Exit';
import { ResetView } from './ResetView';
import { ZoomIn } from './ZoomIn';
import { ZoomOut } from './ZoomOut';

export const ICONS = {
  exit: Exit,
  'reset-view': ResetView,
  'zoom-in': ZoomIn,
  'zoom-out': ZoomOut,
} as const;
