'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  Copy,
  Download,
  Eraser,
  FileCheck2,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';

type PilotStatus = 'planned' | 'completed';

type PilotDraft = {
  status: PilotStatus;
  sessionTitle: string;
  sessionDate: string;
  city: string;
  registered: number;
  attended: number;
  correctNetwork: number;
  publicTransactions: number;
  publicRepositories: number;
  documentedBlockers: number;
  peerHelpers: number;
  day7Returns: number;
  topBlockers: string;
  evidenceLinks: string;
  notes: string;
};

const storageKey = 'nibiru-debug-desk-pilot-v1';

const emptyDraft: PilotDraft = {
  status: 'planned',
  sessionTitle: 'Nibiru India first-build pilot',
  sessionDate: '',
  city: 'Indore, India',
  registered: 0,
  attended: 0,
  correctNetwork: 0,
  publicTransactions: 0,
  publicRepositories: 0,
  documentedBlockers: 0,
  peerHelpers: 0,
  day7Returns: 0,
  topBlockers: '',
  evidenceLinks: '',
  notes: '',
};

const numberFields: Array<{
  key: keyof Pick<
    PilotDraft,
    | 'registered'
    | 'attended'
    | 'correctNetwork'
    | 'publicTransactions'
    | 'publicRepositories'
    | 'documentedBlockers'
    | 'peerHelpers'
    | 'day7Returns'
  >;
  label: string;
  help: string;
}> = [
  {
    key: 'registered',
    label: 'Registered',
    help: 'Valid registrations before the session',
  },
  {
    key: 'attended',
    label: 'Attended',
    help: 'People present for a meaningful portion',
  },
  {
    key: 'correctNetwork',
    label: 'Correct network',
    help: 'Participants who verified Testnet 2',
  },
  {
    key: 'publicTransactions',
    label: 'Public transaction',
    help: 'Participants with a confirmed public tx',
  },
  {
    key: 'publicRepositories',
    label: 'Public repository',
    help: 'Participants or teams with a public repo',
  },
  {
    key: 'documentedBlockers',
    label: 'Documented blocker',
    help: 'Distinct reproducible blockers captured',
  },
  {
    key: 'peerHelpers',
    label: 'Peer helpers',
    help: 'Participants who helped another builder',
  },
  {
    key: 'day7Returns',
    label: 'Day-7 returns',
    help: 'Attendees completing a follow-up action',
  },
];

function percentage(numerator: number, denominator: number) {
  if (!denominator) return '—';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function safeFilePart(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'pilot'
  );
}

export function PilotEvidence() {
  const [draft, setDraft] = useState<PilotDraft>(emptyDraft);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    let parsed: Partial<PilotDraft> | null = null;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        parsed = JSON.parse(saved) as Partial<PilotDraft>;
      }
    } catch {
      // A blocked or malformed browser draft should not stop the tracker.
    }
    const timer = window.setTimeout(() => {
      if (!active) return;
      if (parsed) setDraft({ ...emptyDraft, ...parsed });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const commitDraft = (next: PilotDraft) => {
    setDraft(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // The export tools still work if browser storage is unavailable.
    }
  };

  const errors = useMemo(() => {
    const next: string[] = [];
    if (draft.attended > draft.registered)
      next.push('Attendance cannot be higher than registrations.');
    if (draft.correctNetwork > draft.attended)
      next.push('Correct-network completions cannot exceed attendance.');
    if (draft.publicTransactions > draft.attended)
      next.push('Transaction completions cannot exceed attendance.');
    if (draft.peerHelpers > draft.attended)
      next.push('Peer helpers cannot exceed attendance.');
    if (draft.day7Returns > draft.attended)
      next.push('Day-7 returns cannot exceed attendance.');
    return next;
  }, [draft]);

  const evidenceLinks = useMemo(
    () =>
      draft.evidenceLinks
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    [draft.evidenceLinks],
  );

  const markdown = useMemo(() => {
    const lines = [
      `# ${draft.sessionTitle.trim() || 'Nibiru community pilot'}`,
      '',
      `**Reporting status:** ${draft.status === 'completed' ? 'Completed session' : 'Planned — outcomes not yet claimed'}`,
      `**Date:** ${draft.sessionDate || 'To be confirmed'}`,
      `**Location:** ${draft.city.trim() || 'To be confirmed'}`,
      '',
      '## Aggregate outcomes',
      '',
      '| Measure | Count |',
      '| --- | ---: |',
      `| Registered | ${draft.registered} |`,
      `| Attended | ${draft.attended} |`,
      `| Verified Nibiru Testnet 2 | ${draft.correctNetwork} |`,
      `| Completed a confirmed public transaction | ${draft.publicTransactions} |`,
      `| Created a public repository | ${draft.publicRepositories} |`,
      `| Documented a reproducible blocker | ${draft.documentedBlockers} |`,
      `| Helped another participant | ${draft.peerHelpers} |`,
      `| Returned for a day-7 action | ${draft.day7Returns} |`,
      '',
      '## Rates',
      '',
      `- Attendance: ${percentage(draft.attended, draft.registered)}`,
      `- Testnet setup completion: ${percentage(draft.correctNetwork, draft.attended)}`,
      `- Confirmed transaction completion: ${percentage(draft.publicTransactions, draft.attended)}`,
      `- Day-7 return: ${percentage(draft.day7Returns, draft.attended)}`,
      '',
      '## Recurring blockers',
      '',
      draft.topBlockers.trim() || 'Not yet recorded.',
      '',
      '## Public evidence',
      '',
      ...(evidenceLinks.length
        ? evidenceLinks.map((link) => `- ${link}`)
        : ['No public evidence links added yet.']),
      '',
      '## Notes and next iteration',
      '',
      draft.notes.trim() || 'Not yet recorded.',
      '',
      '## Reporting boundary',
      '',
      'This report contains aggregate counts only. It excludes wallet secrets, private keys, personal participant data, and investment claims. Outcomes should be published only after they are verified.',
      '',
      '_Prepared with Nibiru Debug Desk, an independent community utility that is not affiliated with or endorsed by Nibiru._',
    ];
    return lines.join('\n');
  }, [draft, evidenceLinks]);

  const updateText = (
    key: keyof Pick<
      PilotDraft,
      | 'sessionTitle'
      | 'sessionDate'
      | 'city'
      | 'topBlockers'
      | 'evidenceLinks'
      | 'notes'
    >,
    value: string,
  ) => commitDraft({ ...draft, [key]: value });

  const updateNumber = (
    key: (typeof numberFields)[number]['key'],
    value: string,
  ) => {
    const parsed = Number.parseInt(value, 10);
    commitDraft({
      ...draft,
      [key]: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
    });
  };

  const download = (content: string, extension: 'md' | 'csv', type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${safeFilePart(draft.sessionTitle)}-${draft.sessionDate || 'draft'}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const rows = [
      ['field', 'value'],
      ['reporting_status', draft.status],
      ['session_title', draft.sessionTitle],
      ['session_date', draft.sessionDate],
      ['city', draft.city],
      ...numberFields.map((field) => [field.key, draft[field.key]]),
      ['attendance_rate', percentage(draft.attended, draft.registered)],
      [
        'network_completion_rate',
        percentage(draft.correctNetwork, draft.attended),
      ],
      ['day_7_return_rate', percentage(draft.day7Returns, draft.attended)],
      ['top_blockers', draft.topBlockers],
      ['public_evidence_links', evidenceLinks.join(' | ')],
      ['notes', draft.notes],
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    download(csv, 'csv', 'text/csv');
  };

  const copySummary = async () => {
    if (errors.length) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const clearDraft = () => {
    if (!window.confirm('Clear the pilot draft stored in this browser?'))
      return;
    setDraft({ ...emptyDraft });
    window.localStorage.removeItem(storageKey);
  };

  const exportDisabled = errors.length > 0;

  return (
    <section
      className="pilot-evidence"
      id="pilot-evidence"
      aria-labelledby="pilot-evidence-title"
    >
      <div className="pilot-heading">
        <div>
          <p className="kicker">
            <BarChart3 /> Pilot evidence
          </p>
          <h2 id="pilot-evidence-title">
            Turn a session into verifiable proof.
          </h2>
        </div>
        <p>
          Capture aggregate outcomes, catch inconsistent counts, and export a
          public retrospective. No participant identities or wallet data are
          collected.
        </p>
      </div>

      <div className="pilot-privacy">
        <HardDrive />
        <div>
          <strong>Private working draft</strong>
          <span>
            Autosaved only in this browser. Nothing is submitted to a server.
          </span>
        </div>
        <button type="button" onClick={clearDraft}>
          <Eraser /> Clear draft
        </button>
      </div>

      <div className="pilot-layout">
        <div className="pilot-form">
          <div className="pilot-basics">
            <div className="wide-field">
              <label htmlFor="pilot-title">Session title</label>
              <input
                id="pilot-title"
                value={draft.sessionTitle}
                onChange={(event) =>
                  updateText('sessionTitle', event.target.value)
                }
              />
            </div>
            <div>
              <label htmlFor="pilot-status">Reporting status</label>
              <select
                id="pilot-status"
                value={draft.status}
                onChange={(event) =>
                  commitDraft({
                    ...draft,
                    status: event.target.value as PilotStatus,
                  })
                }
              >
                <option value="planned">Planned — no outcomes claimed</option>
                <option value="completed">Completed — verified counts</option>
              </select>
            </div>
            <div>
              <label htmlFor="pilot-date">Session date</label>
              <input
                id="pilot-date"
                type="date"
                value={draft.sessionDate}
                onChange={(event) =>
                  updateText('sessionDate', event.target.value)
                }
              />
            </div>
            <div>
              <label htmlFor="pilot-city">City or format</label>
              <input
                id="pilot-city"
                value={draft.city}
                onChange={(event) => updateText('city', event.target.value)}
              />
            </div>
          </div>

          <div className="metric-input-grid">
            {numberFields.map((field) => (
              <div key={field.key}>
                <label htmlFor={`pilot-${field.key}`}>{field.label}</label>
                <input
                  id={`pilot-${field.key}`}
                  type="number"
                  min="0"
                  step="1"
                  value={draft[field.key]}
                  onChange={(event) =>
                    updateNumber(field.key, event.target.value)
                  }
                />
                <small>{field.help}</small>
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="pilot-errors" role="alert">
              <strong>Check these counts before exporting:</strong>
              <ul>
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pilot-notes-grid">
            <div>
              <label htmlFor="pilot-blockers">Recurring blockers</label>
              <textarea
                id="pilot-blockers"
                value={draft.topBlockers}
                onChange={(event) =>
                  updateText('topBlockers', event.target.value)
                }
                placeholder="One verified pattern per line; avoid names and private data."
              />
            </div>
            <div>
              <label htmlFor="pilot-evidence-links">
                Public evidence links
              </label>
              <textarea
                id="pilot-evidence-links"
                value={draft.evidenceLinks}
                onChange={(event) =>
                  updateText('evidenceLinks', event.target.value)
                }
                placeholder={
                  'Public repository, recap, or transaction link\nOne link per line'
                }
              />
            </div>
            <div className="wide-field">
              <label htmlFor="pilot-notes">Notes and next iteration</label>
              <textarea
                id="pilot-notes"
                value={draft.notes}
                onChange={(event) => updateText('notes', event.target.value)}
                placeholder="What worked, what did not, and the single change for the next session."
              />
            </div>
          </div>
        </div>

        <aside className="pilot-summary" aria-label="Pilot outcome summary">
          <div className="pilot-status-line">
            <span className={`pilot-status pilot-status-${draft.status}`}>
              {draft.status === 'completed' ? 'Completed' : 'Planned'}
            </span>
            <ShieldCheck /> Aggregate only
          </div>
          <h3>{draft.sessionTitle || 'Untitled pilot'}</h3>
          <p>
            {draft.city || 'Location to be confirmed'} ·{' '}
            {draft.sessionDate || 'Date to be confirmed'}
          </p>
          <dl>
            <div>
              <dt>Attendance</dt>
              <dd>{percentage(draft.attended, draft.registered)}</dd>
            </div>
            <div>
              <dt>Testnet setup</dt>
              <dd>{percentage(draft.correctNetwork, draft.attended)}</dd>
            </div>
            <div>
              <dt>Confirmed tx</dt>
              <dd>{percentage(draft.publicTransactions, draft.attended)}</dd>
            </div>
            <div>
              <dt>Day-7 return</dt>
              <dd>{percentage(draft.day7Returns, draft.attended)}</dd>
            </div>
          </dl>
          <div className="pilot-integrity-note">
            <FileCheck2 />
            <p>
              Keep the status as <strong>planned</strong> until the session has
              happened and every published count can be defended.
            </p>
          </div>
          <div className="pilot-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => void copySummary()}
              disabled={exportDisabled}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? 'Copied' : 'Copy report'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => download(markdown, 'md', 'text/markdown')}
              disabled={exportDisabled}
            >
              <Download /> Markdown
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={downloadCsv}
              disabled={exportDisabled}
            >
              <Download /> CSV
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
