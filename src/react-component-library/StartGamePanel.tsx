import { useId } from 'react';
import type * as React from 'react';
import { Panel } from './atlas-styles';

type StartGamePanelProps = {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children: React.ReactNode;
};

export const StartGamePanel: React.FC<StartGamePanelProps> = ({
  title,
  subtitle,
  children,
}) => {
  const titleId = useId();

  return (
    <Panel aria-labelledby={titleId}>
      <h1 id={titleId}>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </Panel>
  );
};
