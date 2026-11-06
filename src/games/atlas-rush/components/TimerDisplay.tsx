import type * as React from 'react';
import { formatTime } from '../domain/time';
import styles from './AtlasRush.module.css';

type TimerDisplayProps = { seconds: number };
export const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => (
  <div className={styles.hudMetric}>
    <span>Countdown</span>
    <strong className={seconds <= 30 ? styles.urgent : undefined}>
      {formatTime(seconds)}
    </strong>
  </div>
);
