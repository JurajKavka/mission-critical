import { useId } from 'react';
import type * as React from 'react';
import * as UI from './WellcomePanel.styles';

type WellcomePanelProps = {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children: React.ReactNode;
};

export const WellcomePanel: React.FC<WellcomePanelProps> = ({
  title,
  subtitle,
  children,
}) => {
  const titleId = useId();

  return (
    <UI.Card as="section" aria-labelledby={titleId}>
      <UI.Title id={titleId}>{title}</UI.Title>
      <UI.Subtitle>{subtitle}</UI.Subtitle>
      {children}
    </UI.Card>
  );
};
