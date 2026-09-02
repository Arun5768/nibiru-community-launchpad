import {
  ArrowUpRight,
  Blocks,
  CheckCircle2,
  CircleDot,
  Code2,
  FileCheck2,
  GitFork,
  MapPin,
  Radio,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react';
import { LaunchpadConsole } from '@/components/launchpad-console';

const builderSteps = [
  {
    number: '01',
    title: 'Know the network',
    copy: 'Understand Nibiru EVM, the testnet, and where your first transaction will run.',
    status: 'Start here',
  },
  {
    number: '02',
    title: 'Configure your wallet',
    copy: 'Add the permanent testnet with the official RPC and verify chain ID 6911.',
    status: '5 min',
  },
  {
    number: '03',
    title: 'Make an on-chain action',
    copy: 'Use a testnet wallet to complete a small, traceable builder task.',
    status: 'Next',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="signal-grid" aria-hidden="true" />

      <header className="relative z-10 border-b border-white/10 bg-[#07080c]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a
            href="#top"
            className="flex items-center gap-3"
            aria-label="Nibiru Community Launchpad home"
          >
            <span className="grid size-9 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
              <Blocks className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight">
                Nibiru Community Launchpad
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Independent proof of work
              </span>
            </span>
          </a>

          <a
            href="#builder-path"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
          >
            Start the path <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </header>

      <section
        id="top"
        className="relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-10 lg:px-8 lg:pb-20 lg:pt-16"
      >
        <div className="mb-8 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
          <span className="rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1.5 text-lime-200">
            Community-built
          </span>
          <span>Indore · India</span>
          <span className="h-px w-8 bg-white/15" />
          <span>Testnet-first onboarding</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold text-cyan-200">
              <Radio className="size-4" /> A practical entry point for new
              Nibiru builders
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
              From “what is Nibiru?” to a verifiable first build.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              A working community onboarding surface that combines live network
              context, a guided builder path, and an event-ready facilitator
              system.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#builder-path" className="primary-action">
                Begin the builder path <ArrowUpRight className="size-4" />
              </a>
              <a
                href="https://nibiru.fi/docs/dev"
                target="_blank"
                rel="noreferrer"
                className="secondary-action"
              >
                Read official docs <Code2 className="size-4" />
              </a>
            </div>

            <div className="mt-10 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
              {[
                ['01', 'Learn the network'],
                ['02', 'Complete a task'],
                ['03', 'Prove the result'],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="flex items-center gap-3 text-sm text-white/62"
                >
                  <span className="font-mono text-xs text-cyan-200">
                    {number}
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="network-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Network pulse</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Nibiru Testnet
                </h2>
              </div>
              <span className="flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-xs font-semibold text-lime-200">
                <span className="size-1.5 rounded-full bg-lime-300 shadow-[0_0_12px_#bef264]" />{' '}
                Ready
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="metric">
                <span>Network</span>
                <strong>Testnet 2</strong>
              </div>
              <div className="metric">
                <span>EVM chain ID</span>
                <strong>6911</strong>
              </div>
              <div className="metric col-span-2">
                <span>RPC target</span>
                <strong className="break-all font-mono text-sm">
                  evm-rpc.testnet-2.nibiru.fi
                </strong>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-cyan-200" />
                <div>
                  <p className="text-sm font-semibold">
                    Official configuration
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Values mirror the current Nibiru network documentation.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <LaunchpadConsole />

        <section
          id="builder-path"
          className="mt-8 rounded-[30px] border border-white/10 bg-[#0d0f16]/90 p-6 sm:p-8"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Builder path · 30–45 minutes</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
                One path. One proof. No jargon maze.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white/50">
              <CircleDot className="size-4 text-cyan-200" /> Workshop-ready
              curriculum
            </div>
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-3">
            {builderSteps.map((step) => (
              <article key={step.number} className="step-card">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-200">
                    {step.number}
                  </span>
                  <span className="rounded-full bg-white/[0.055] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                    {step.status}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  {step.copy}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs text-white/45">
            <span className="flex items-center gap-2">
              <Users className="size-3.5 text-lime-200" /> Built for cohorts of
              25–60
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5 text-lime-200" /> Designed for Indore
              builder sessions
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-lime-200" /> Outcome-first,
              not attendance-first
            </span>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="plan-card">
            <p className="eyebrow">90-minute facilitator runbook</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              A workshop that ends with evidence.
            </h2>
            <div className="mt-6 space-y-4">
              {[
                ['00–10', 'Context, safety and the builder outcome'],
                ['10–25', 'Wallet and Testnet 2 setup'],
                ['25–40', 'Guided first on-chain action'],
                ['40–70', 'Team build sprint with mentor checkpoints'],
                ['70–85', 'Transaction verification and demos'],
                ['85–90', 'Contributor pathway and next challenge'],
              ].map(([time, label]) => (
                <div key={time} className="timeline-row">
                  <span>{time}</span>
                  <p>{label}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="plan-card">
            <p className="eyebrow">India community operating system</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Start narrow. Measure. Then expand.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                [
                  '01',
                  'Indore pilot',
                  '25–40 selected builders. Baseline every outcome.',
                ],
                [
                  '02',
                  'Bhopal repeat',
                  'Improve the curriculum using pilot friction.',
                ],
                [
                  '03',
                  'City playbook',
                  'Publish the runbook for trusted local leads.',
                ],
              ].map(([number, title, copy]) => (
                <div key={number} className="rollout-card">
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="outcome-card">
                <strong>70%+</strong>
                <span>complete wallet setup</span>
              </div>
              <div className="outcome-card">
                <strong>15+</strong>
                <span>verified transactions</span>
              </div>
              <div className="outcome-card">
                <strong>5+</strong>
                <span>public build proofs</span>
              </div>
              <div className="outcome-card">
                <strong>30 day</strong>
                <span>contributor follow-up</span>
              </div>
            </div>
          </article>
        </section>

        <section
          id="evidence"
          className="mt-8 rounded-[30px] border border-white/10 bg-[#0d0f16]/90 p-6 sm:p-8"
        >
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Open proof, not promises</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
                A contribution package another organizer can reuse.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/48">
                The live product is backed by a technical case study, a
                facilitator playbook, a machine-readable evidence receipt, and a
                public verification script.
              </p>
            </div>
            <a
              href="https://github.com/Arun5768/nibiru-community-launchpad"
              target="_blank"
              rel="noreferrer"
              className="secondary-action"
            >
              Inspect the repository <ArrowUpRight className="size-4" />
            </a>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: FileCheck2,
                title: 'Builder-proof receipt',
                copy: 'Verify a public address and transaction, then export a transparent JSON evidence record.',
                href: 'https://github.com/Arun5768/nibiru-community-launchpad/blob/main/docs/EVIDENCE_SCHEMA.md',
                label: 'Read the schema',
              },
              {
                icon: Workflow,
                title: 'Facilitator playbook',
                copy: 'A repeatable 90-minute lab with setup gates, safety checks, metrics, and follow-up.',
                href: 'https://github.com/Arun5768/nibiru-community-launchpad/blob/main/docs/FACILITATOR_PLAYBOOK.md',
                label: 'Open the playbook',
              },
              {
                icon: GitFork,
                title: 'Technical case study',
                copy: 'Architecture, decisions, limitations, verification commands, and the next contribution path.',
                href: 'https://github.com/Arun5768/nibiru-community-launchpad/blob/main/docs/TECHNICAL_CASE_STUDY.md',
                label: 'See the case study',
              },
            ].map(({ icon: Icon, title, copy, href, label }) => (
              <article key={title} className="evidence-card">
                <span className="evidence-icon">
                  <Icon className="size-4" />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <a href={href} target="_blank" rel="noreferrer">
                  {label} <ArrowUpRight className="size-3.5" />
                </a>
              </article>
            ))}
          </div>

          <div className="architecture-flow" aria-label="Project architecture">
            <span>Builder</span>
            <i>→</i>
            <span>Cloudflare UI</span>
            <i>→</i>
            <span>Safe server route</span>
            <i>→</i>
            <span>Nibiru Testnet 2 RPC</span>
            <i>→</i>
            <span>Verifiable receipt</span>
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-5 border-t border-white/10 py-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-6">
            Independent community proof of work by Arun Chandel. Not affiliated
            with or endorsed by Nibiru. Never enter a seed phrase or private
            key. Testnet tokens have no monetary value.
          </p>
          <div className="flex gap-4 font-semibold">
            <a
              href="https://github.com/Arun5768/nibiru-community-launchpad"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-200"
            >
              Repository
            </a>
            <a href="#evidence" className="hover:text-cyan-200">
              Evidence
            </a>
            <a
              href="https://nibiru.fi/docs/dev"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-200"
            >
              Official docs
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}
