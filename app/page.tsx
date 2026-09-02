import {
  ArrowUpRight,
  BookOpen,
  Code2,
  LifeBuoy,
  LockKeyhole,
} from 'lucide-react';
import { DebugDesk } from '@/components/debug-desk';

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
