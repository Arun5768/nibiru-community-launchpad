import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Code2,
  Languages,
  LifeBuoy,
  LockKeyhole,
  UsersRound,
} from 'lucide-react';
import { DebugDesk } from '@/components/debug-desk';
import { PilotEvidence } from '@/components/pilot-evidence';
import { PilotProtocol } from '@/components/pilot-protocol';

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a href="#top" className="brand" aria-label="Nibiru Debug Desk home">
            <span className="brand-mark" aria-hidden="true">
              N
            </span>
            <span>
              <strong>Nibiru Debug Desk</strong>
              <small>Independent community utility</small>
            </span>
          </a>
          <nav className="topnav" aria-label="Useful links">
            <a
              href="https://nibiru.fi/docs/dev"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen /> Docs
            </a>
            <a
              href="https://testnet.nibiscan.io"
              target="_blank"
              rel="noreferrer"
            >
              Explorer <ArrowUpRight />
            </a>
            <a href="#field-kit">
              <UsersRound /> Field kit
            </a>
            <a href="#self-guided-pilot">
              <CalendarDays /> Run the pilot
            </a>
            <a href="#pilot-evidence">
              <CalendarDays /> Record proof
            </a>
            <a
              href="https://github.com/Arun5768/nibiru-community-launchpad"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 /> Source
            </a>
          </nav>
        </div>
      </header>

      <div id="top" className="page-wrap">
        <section className="intro-panel" aria-labelledby="page-title">
          <div>
            <p className="kicker">
              <LifeBuoy /> Troubleshooting for Nibiru EVM Testnet 2
            </p>
            <h1 id="page-title">Find the failure before asking for help.</h1>
            <p className="intro-copy">
              Check the network, inspect a public address or transaction, then
              export a clean report for a maintainer or community channel.
            </p>
          </div>
          <div className="safety-note">
            <LockKeyhole />
            <div>
              <strong>Read-only by design</strong>
              <span>Never enter a seed phrase or private key.</span>
            </div>
          </div>
        </section>

        <DebugDesk />

        <PilotProtocol />

        <PilotEvidence />

        <section
          className="field-kit"
          id="field-kit"
          aria-labelledby="field-kit-title"
        >
          <div className="field-kit-heading">
            <div>
              <p className="kicker">
                <UsersRound /> Community field kit
              </p>
              <h2 id="field-kit-title">Designed to work beyond the demo.</h2>
            </div>
            <p>
              A public, reviewable pilot for helping an India-based cohort
              complete a first Testnet 2 action. The materials are ready;
              results will be added only after a real session.
            </p>
          </div>
          <div className="field-kit-grid">
            <a
              href="https://github.com/Arun5768/nibiru-community-launchpad/blob/main/community-pilot/FIRST_SESSION.md"
              target="_blank"
              rel="noreferrer"
            >
              <CalendarDays />
              <span>Run the session</span>
              <strong>60-minute first-build workshop</strong>
              <small>Roles, timing, challenge cards, and follow-up</small>
              <ArrowUpRight />
            </a>
            <a
              href="https://github.com/Arun5768/nibiru-community-launchpad/blob/main/community-pilot/HINDI_QUICKSTART.md"
              target="_blank"
              rel="noreferrer"
            >
              <Languages />
              <span>Make onboarding clearer</span>
              <strong>English + Hindi quick start</strong>
              <small>Safety, network checks, and support vocabulary</small>
              <ArrowUpRight />
            </a>
            <a
              href="https://github.com/Arun5768/nibiru-community-launchpad/tree/main/community-pilot"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen />
              <span>Review the complete kit</span>
              <strong>Content, care, and measurement</strong>
              <small>Transparent templates with no invented outcomes</small>
              <ArrowUpRight />
            </a>
          </div>
        </section>

        <footer className="footer">
          <p>
            Built by Arun Chandel as an independent open-source contribution.
            Not an official Nibiru support product.
          </p>
          <div>
            <a
              href="https://nibiru.fi/docs/dev/networks"
              target="_blank"
              rel="noreferrer"
            >
              Network configuration
            </a>
            <a
              href="https://github.com/NibiruChain"
              target="_blank"
              rel="noreferrer"
            >
              Nibiru open source
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
