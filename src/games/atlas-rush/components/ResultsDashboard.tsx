import { useCallback, useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { GlobalStyles } from '../../../react-component-library/atlas-styles';
import { ResultsDetails } from '../../../react-component-library/ResultsDetails';
import { Breadcrumbs } from '../../../react-component-library/Breadcrumbs';
import { CheckboxButton } from '../../../react-component-library/CheckboxButton';
import { AtlasRushLayout } from '../../../react-component-library/game-layouts';
import { regionMetadata } from '../data/regions';
import { getProgress, getProgressGroup } from '../domain/progress';
import { formatTime } from '../domain/time';
import type { GameResults } from '../domain/types';
import { openSessionDatabase } from '../infrastructure/persistence/database';
import { createResultsRepository } from '../infrastructure/persistence/results-repository';
import type { ResultRecord } from '../infrastructure/persistence/results-repository';
import { encodeSharedResult } from '../infrastructure/share-result';
import { Dashboard } from './ResultsDashboard.styles';
import { CoverageChart } from './CoverageChart';
import {
  ResultActionRow,
  ResultField,
  ResultInputRow,
  ResultShare,
} from './ResultControls.styles';

const getMode = (result: GameResults): string => {
  if (result.config.answerComparison?.mode === 'prefix') {
    return `Speed ${result.config.answerComparison.minimumCharacters}`;
  }
  return 'Full name';
};

const getGroupLabel = (result: GameResults): string =>
  `${regionMetadata[result.config.regionId].name} · ${result.config.level} · ${result.config.learning ? 'Learning' : 'Standard'} · ${getMode(result)} · v${result.challengeVersion}`;

export const ResultsDashboard: React.FC = () => {
  const [records, setRecords] = useState<ResultRecord[]>([]);
  const [status, setStatus] = useState('Loading results…');
  const [region, setRegion] = useState('all');
  const [level, setLevel] = useState('all');
  const [learning, setLearning] = useState('all');
  const [mode, setMode] = useState('all');
  const [group, setGroup] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [includeName, setIncludeName] = useState(false);
  const [notice, setNotice] = useState('');
  const detailsHeading = useRef<HTMLHeadingElement>(null);
  const detailsButton = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    try {
      const database = await openSessionDatabase();
      try {
        const results = await createResultsRepository(database).list();
        setRecords(results);
        setGroup((previous) => {
          if (
            results.some(
              (record) => getProgressGroup(record.result) === previous,
            )
          ) {
            return previous;
          }
          return results[0] ? getProgressGroup(results[0].result) : '';
        });
        setStatus('');
      } finally {
        database.close();
      }
    } catch {
      setStatus('Results are unavailable on this device.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (selected) {
      detailsHeading.current?.focus();
    }
  }, [selected]);
  const visible = records.filter(
    ({ result }) =>
      (region === 'all' || result.config.regionId === region) &&
      (level === 'all' || result.config.level === level) &&
      (learning === 'all' || String(result.config.learning) === learning) &&
      (mode === 'all' ||
        (result.config.answerComparison?.mode === 'prefix'
          ? 'speed'
          : 'full') === mode),
  );
  const groups = records.filter(
    (record, index) =>
      records.findIndex(
        (other) =>
          getProgressGroup(other.result) === getProgressGroup(record.result),
      ) === index,
  );
  const progress = getProgress(records, group);
  const current = records.find((record) => record.attemptId === selected);
  const editName = async () => {
    if (!current || Array.from(name.trim()).length > 32) {
      setNotice('Enter a name of up to 32 characters.');
      return;
    }
    try {
      const database = await openSessionDatabase();
      try {
        await createResultsRepository(database).updateName(
          current.attemptId,
          name.trim(),
        );
      } finally {
        database.close();
      }
      setNotice('Name saved.');
      await refresh();
    } catch {
      setNotice('Name could not be saved.');
    }
  };
  const deleteResult = async () => {
    if (!current || !window.confirm('Delete this result?')) {
      return;
    }
    try {
      const database = await openSessionDatabase();
      try {
        await createResultsRepository(database).remove(current.attemptId);
      } finally {
        database.close();
      }
      setSelected(null);
      await refresh();
    } catch {
      setNotice('Result could not be deleted.');
    }
  };
  const selectResult = (record: ResultRecord, button: HTMLButtonElement) => {
    detailsButton.current = button;
    setSelected(record.attemptId);
    setName(record.displayName ?? '');
    setIncludeName(false);
    setNotice('');
  };

  const closeResult = () => {
    setSelected(null);
    detailsButton.current?.focus();
  };
  const shareUrl =
    current && typeof window !== 'undefined'
      ? `${window.location.origin}/games/atlas-rush/results/shared/${encodeSharedResult(current.result, includeName ? current.displayName : undefined)}/`
      : '';
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice('Link copied.');
    } catch {
      setNotice('Select the link to copy it.');
    }
  };

  return (
    <>
      <GlobalStyles />
      <Dashboard>
        <AtlasRushLayout.TopBar>
          <Breadcrumbs
            breadcrumbs={[{ label: 'Atlas Rush', link: '/games/atlas-rush/' }]}
          />
        </AtlasRushLayout.TopBar>
        <h1>My results</h1>
        {status && (
          <p className="panel" role="status">
            {status}
          </p>
        )}
        {!status && records.length === 0 && (
          <section className="panel">
            <h2>No results yet</h2>
            <p className="hint">Finish a survey to see your progress here.</p>
            <a className="start-survey" href="/games/atlas-rush/">
              Start survey
            </a>
          </section>
        )}
        {records.length > 0 && (
          <>
            <section className="panel progress">
              <h2>Progress</h2>
              <label className="progress-filter">
                Progress for{' '}
                <select
                  value={group}
                  onChange={(event) => setGroup(event.target.value)}
                >
                  {groups.map((record) => (
                    <option
                      key={getProgressGroup(record.result)}
                      value={getProgressGroup(record.result)}
                    >
                      {getGroupLabel(record.result)}
                    </option>
                  ))}
                </select>
              </label>
              <dl className="summary">
                <div>
                  <dt>Attempts</dt>
                  <dd>{progress.attempts}</dd>
                </div>
                <div>
                  <dt>Best coverage</dt>
                  <dd className="best-coverage">{progress.bestCoverage}%</dd>
                </div>
                <div>
                  <dt>Best time</dt>
                  <dd>
                    {progress.fastest === null
                      ? '—'
                      : formatTime(progress.fastest)}
                  </dd>
                </div>
              </dl>
              {progress.attempts === 1 && (
                <p className="hint">
                  Complete another survey with these settings to compare
                  attempts.
                </p>
              )}
              <CoverageChart
                points={progress.recent.map((record) => ({
                  attemptId: record.attemptId,
                  coverage: record.result.coverage,
                }))}
              />
            </section>
            <section className="panel">
              <div className="section-heading">
                <h2>History</h2>
                <span className="history-count">
                  {visible.length} of {records.length} results
                </span>
              </div>
              <div className="filters">
                <label>
                  Region{' '}
                  <select
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                  >
                    <option value="all">All</option>
                    {Object.values(regionMetadata).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Difficulty{' '}
                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="beginner">Beginner</option>
                    <option value="middle">Middle</option>
                    <option value="expert">Expert</option>
                  </select>
                </label>
                <label>
                  Learning{' '}
                  <select
                    value={learning}
                    onChange={(event) => setLearning(event.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </select>
                </label>
                <label>
                  Answer mode{' '}
                  <select
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="full">Full name</option>
                    <option value="speed">Speed</option>
                  </select>
                </label>
              </div>
              {visible.length === 0 && (
                <p className="hint">No results match these filters.</p>
              )}
              <table className="desktop-history" hidden={visible.length === 0}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Region</th>
                    <th>Difficulty</th>
                    <th>Mode</th>
                    <th>Score</th>
                    <th>Time</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((record) => (
                    <tr key={record.attemptId}>
                      <td>
                        {new Date(record.finishedAt).toLocaleDateString()}
                      </td>
                      <td>
                        {regionMetadata[record.result.config.regionId].name}
                      </td>
                      <td>{record.result.config.level}</td>
                      <td>
                        {record.result.config.learning ? 'Learning · ' : ''}
                        {getMode(record.result)}
                      </td>
                      <td>
                        {record.result.correct}/{record.result.total} (
                        {record.result.coverage}%)
                      </td>
                      <td>{formatTime(record.result.elapsedSeconds)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={(event) =>
                            selectResult(record, event.currentTarget)
                          }
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cards">
                {visible.map((record) => (
                  <article className="history-card" key={record.attemptId}>
                    <h3>
                      {regionMetadata[record.result.config.regionId].name}
                    </h3>
                    <p className="history-meta">
                      {new Date(record.finishedAt).toLocaleDateString()} ·{' '}
                      {record.result.config.level} ·{' '}
                      {record.result.config.learning ? 'Learning · ' : ''}
                      {getMode(record.result)}
                    </p>
                    <p className="history-score">
                      {record.result.correct}/{record.result.total} ·{' '}
                      {record.result.coverage}% ·{' '}
                      {formatTime(record.result.elapsedSeconds)}
                    </p>
                    <button
                      type="button"
                      onClick={(event) =>
                        selectResult(record, event.currentTarget)
                      }
                    >
                      Details
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {current && (
          <section className="panel" aria-label="Result details">
            <h2 ref={detailsHeading} tabIndex={-1}>
              {current.result.finishReason === 'completed'
                ? 'Atlas complete'
                : 'Time is up'}
            </h2>
            <ResultsDetails result={current.result} />
            <ResultInputRow>
              <ResultField>
                Display name
                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      Array.from(event.target.value).slice(0, 32).join(''),
                    )
                  }
                />
              </ResultField>
              <button
                type="button"
                onClick={() => {
                  void editName();
                }}
              >
                Save name
              </button>
            </ResultInputRow>
            <ResultShare>
              <p className="hint">
                The share link contains your score and challenge settings.
              </p>
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
                <button
                  type="button"
                  onClick={() => {
                    void copyLink();
                  }}
                >
                  Copy link
                </button>
              </ResultInputRow>
            </ResultShare>
            <ResultActionRow>
              <button
                type="button"
                onClick={() => {
                  void deleteResult();
                }}
              >
                Delete result
              </button>
              <button type="button" onClick={closeResult}>
                Close
              </button>
            </ResultActionRow>
            <p role="status">{notice}</p>
          </section>
        )}
      </Dashboard>
    </>
  );
};
