import type * as React from 'react';
import { formatTime } from '../domain/time';
import * as UI from '../../../react-component-library/atlas-styles';

type TimerDisplayProps = { seconds: number };
export const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => (
  <UI.HudMetric>
    <span>Countdown</span>
    <strong data-urgent={seconds <= 30}>{formatTime(seconds)}</strong>
  </UI.HudMetric>
);
