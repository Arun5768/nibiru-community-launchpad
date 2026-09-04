'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CircleGauge,
  ClipboardCheck,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  TimerReset,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const steps = [
  {
    time: '00–02 min',
    title: 'Confirm the safety boundary',
    detail:
      'Use Testnet 2 and public chain data only. Never paste a seed phrase, private key, personal identifier, or mainnet funds.',
  },
  {
    time: '02–05 min',
    title: 'Verify the network',
    detail:
      'Refresh Network health. Confirm that the endpoint responds and that the chain ID is 6911 before diagnosing anything else.',
  },
  {
    time: '05–09 min',
    title: 'Inspect one public record',
    detail:
      'Check a public Testnet 2 address or transaction hash. Note whether the result is understandable and technically useful.',
  },
  {
    time: '09–12 min',
    title: 'Create a support report',
    detail:
      'Describe what happened and the reproduction steps, then copy or download the generated Markdown report.',
  },
  {
    time: '12–15 min',
    title: 'Submit honest feedback',
    detail:
      'Report what worked, what failed, and one improvement. A completed checklist is not counted as success without evidence.',
  },
];

const storageKey = 'nibiru-debug-desk-self-guided-pilot-v1';

export function PilotProtocol() {
  const [completed, setCompleted] = useState<boolean[]>(() =>
    steps.map(() => false),
  );

  useEffect(() => {
    let active = true;
    let parsedSteps: boolean[] | null = null;
    try {
      const saved = window.localStorage.getItem(storageKey);
      const parsed = saved ? (JSON.parse(saved) as unknown) : null;
      if (
        Array.isArray(parsed) &&
        parsed.length === steps.length &&
        parsed.every((value) => typeof value === 'boolean')
      ) {
        parsedSteps = parsed;
      }
    } catch {
      // A blocked or malformed local draft must not stop the protocol.
    }
    const timer = window.setTimeout(() => {
      if (active && parsedSteps) setCompleted(parsedSteps);
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const completedCount = completed.filter(Boolean).length;
  const progress = useMemo(
    () => Math.round((completedCount / steps.length) * 100),
    [completedCount],
  );

  const updateStep = (index: number, value: boolean) => {
    const next = completed.map((current, currentIndex) =>
      currentIndex === index ? value : current,
    );
    setCompleted(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // The checklist remains usable when local storage is unavailable.
    }
  };

  const reset = () => {
    const next = steps.map(() => false);
    setCompleted(next);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Nothing else to clear.
    }
  };

  return (
    <section
      className="pilot-protocol"
      id="self-guided-pilot"
      aria-labelledby="pilot-protocol-title"
    >
      <div className="protocol-heading">
        <div>
          <p className="kicker">
            <TimerReset /> Open community pilot
          </p>
          <h2 id="pilot-protocol-title">Test the workflow in 15 minutes.</h2>
          <p>
            Run one real diagnostic from start to finish. Your checklist stays
            in this browser; only the feedback you choose to post is shared.
          </p>
        </div>
        <div className="protocol-progress" aria-label={`${progress}% complete`}>
          <div>
            <CircleGauge />
            <span>
              <strong>{completedCount}/5</strong>
              steps complete
            </span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <button type="button" onClick={reset} disabled={completedCount === 0}>
            <RotateCcw /> Reset
          </button>
        </div>
      </div>

      <ol className="protocol-steps">
        {steps.map((step, index) => (
          <li key={step.title} className={completed[index] ? 'done' : ''}>
            <Checkbox
              id={`protocol-step-${index}`}
              checked={completed[index]}
              onCheckedChange={(value) => updateStep(index, value === true)}
              aria-label={`Mark ${step.title} complete`}
            />
            <label htmlFor={`protocol-step-${index}`}>
              <span>{step.time}</span>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </label>
          </li>
        ))}
      </ol>

      <div className="protocol-footer">
        <div className="evidence-standard">
          <ShieldCheck />
          <p>
            <strong>Evidence standard:</strong> public testnet links, a
            reproducible report, or a public issue. Screenshots and quotes are
            published only with the contributor&apos;s permission.
          </p>
        </div>
        <div className="protocol-actions">
          <a
            href="https://github.com/Arun5768/nibiru-community-launchpad/issues/new?template=pilot-feedback.yml"
            target="_blank"
            rel="noreferrer"
            className="primary-button"
          >
            <GitBranch /> Share pilot feedback <ArrowUpRight />
          </a>
          <a
            href="https://github.com/Arun5768/nibiru-community-launchpad/blob/main/docs/SELF_GUIDED_PILOT.md"
            target="_blank"
            rel="noreferrer"
            className="secondary-button"
          >
            <ClipboardCheck /> Read the test protocol
          </a>
        </div>
      </div>
    </section>
  );
}
