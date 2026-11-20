import { useState } from 'react';
import type * as React from 'react';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { ResultsPanel } from '../../../react-component-library/ResultsPanel';
import { CheckboxButton } from '../../../react-component-library/CheckboxButton';
import { SecondaryButton } from '../../../react-component-library/SecondaryButton';
import { theme } from '../../../react-component-library/theme';
import type { GameResults } from '../domain/types';
import type { ResultSaveStatus } from '../hooks/useSessionPersistence';
import { openSessionDatabase } from '../infrastructure/persistence/database';
import { createResultsRepository } from '../infrastructure/persistence/results-repository';
import { encodeSharedResult } from '../infrastructure/share-result';
import { ModalDialog } from './ModalDialog';
import {
  ResultActionRow,
  ResultField,
  ResultInputRow,
  ResultShare,
} from './ResultControls.styles';

const ResultTools = styled.div`
  display: grid;
  gap: ${rem(12)};
  margin-top: ${rem(16)};
  padding-top: ${rem(12)};
  border-top: ${rem(1)} solid ${theme.colors.cyanSubtle};

  input:not([type='checkbox']) {
    min-width: 0;
    min-height: ${rem(42)};
    font: inherit;
    font-size: ${theme.fontSizes.paragraphBig};
    padding: ${rem(8)} ${rem(10)};
    color: ${theme.colors.text};
    background: ${theme.colors.panelDark};
    border: ${rem(1)} solid ${theme.colors.inputBorder};

    &:focus-visible {
      border-color: ${theme.colors.cyan};
      box-shadow: inset 0 0 0 ${rem(1)} ${theme.colors.cyan};
      outline: 0;
    }
  }

  p {
    margin: 0;
  }

  [role='status']:empty {
    position: absolute;
  }

  [data-save-status='saved'] {
    color: ${theme.colors.green};
  }

  [data-save-status='error'] {
    color: ${theme.colors.amber};
  }

  a {
    color: ${theme.colors.cyan};
    font-size: ${theme.fontSizes.small};
    text-underline-offset: 0.2em;
  }
`;

type AtlasRushResultsProps = {
  result: GameResults;
  onPlayAgain: () => void;
  onChangeSettings: () => void;
  attemptId?: string | null;
  waitForSave?: () => Promise<void>;
  saveStatus?: ResultSaveStatus;
  onRetrySave?: () => void;
};

export const AtlasRushResults: React.FC<AtlasRushResultsProps> = ({
  result,
  onPlayAgain,
  onChangeSettings,
  attemptId,
  waitForSave,
  saveStatus = 'idle',
  onRetrySave,
}) => {
  const [name, setName] = useState('');
  const [includeName, setIncludeName] = useState(false);
  const [notice, setNotice] = useState('');
  const [showShare, setShowShare] = useState(false);
  const saveName = async () => {
    if (!attemptId || Array.from(name.trim()).length > 32) {
      setNotice('Enter a name of up to 32 characters.');
      return;
    }
    try {
      await waitForSave?.();
      const database = await openSessionDatabase();
      try {
        const saved = await createResultsRepository(database).updateName(
          attemptId,
          name.trim(),
        );
        setNotice(
          saved ? 'Name saved on this device.' : 'Result could not be saved.',
        );
      } finally {
        database.close();
      }
    } catch {
      setNotice('Result could not be saved.');
    }
  };
  const shareUrl =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}/games/atlas-rush/results/shared/${encodeSharedResult(result, includeName ? name.trim() : undefined)}/`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice('Link copied.');
    } catch {
      setNotice('Select the link to copy it.');
    }
  };
  const openResults = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    await waitForSave?.();
    window.location.assign('/games/atlas-rush/results/');
  };
  return (
    <ModalDialog labelledBy="results-title" isFullScreen>
      <ResultsPanel
        result={result}
        onPlayAgain={onPlayAgain}
        onChangeSettings={onChangeSettings}
      >
        <ResultTools>
          <p role="status" data-save-status={saveStatus}>
            {saveStatus === 'saving' && 'Saving result…'}
            {saveStatus === 'saved' && 'Saved on this device.'}
            {saveStatus === 'error' && 'Result could not be saved.'}
          </p>
          {saveStatus === 'error' && onRetrySave && (
            <ResultActionRow>
              <SecondaryButton label="Retry save" onClick={onRetrySave} />
            </ResultActionRow>
          )}
          <ResultInputRow>
            <ResultField>
              Display name
              <input
                placeholder="Optional"
                value={name}
                onChange={(event) =>
                  setName(Array.from(event.target.value).slice(0, 32).join(''))
                }
              />
            </ResultField>
            <SecondaryButton
              label="Save name"
              onClick={() => {
                void saveName();
              }}
            />
          </ResultInputRow>
          <ResultActionRow>
            <SecondaryButton
              label="Share result"
              onClick={() => setShowShare((open) => !open)}
            />
          </ResultActionRow>
          {showShare && (
            <ResultShare>
              <p>The link contains your score and challenge settings.</p>
              <CheckboxButton
                label="Include display name"
                checked={includeName}
                onChange={(event) => setIncludeName(event.target.checked)}
              />
              <ResultInputRow>
                <ResultField>
                  Share link
                  <input readOnly value={shareUrl} />
                </ResultField>
                <SecondaryButton
                  label="Copy link"
                  onClick={() => {
                    void copyLink();
                  }}
                />
              </ResultInputRow>
            </ResultShare>
          )}
          <p role="status">{notice}</p>
          <p>
            <a
              href="/games/atlas-rush/results/"
              onClick={(event) => {
                void openResults(event);
              }}
            >
              My results
            </a>
          </p>
        </ResultTools>
      </ResultsPanel>
    </ModalDialog>
  );
};
