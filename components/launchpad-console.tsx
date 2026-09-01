'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Loader2, RefreshCw, Search, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

type NetworkState = {
  online: boolean;
  chainId?: number | null;
  latestBlock?: number | null;
  client?: string;
  latencyMs?: number;
  checkedAt?: string;
  message?: string;
};

const tasks = [
  'Read the Nibiru EVM overview',
  'Add Testnet 2 to a wallet',
  'Receive testnet tokens',
  'Complete one on-chain action',
  'Verify and share the transaction',
];

const network = {
  name: 'Nibiru Testnet 2',
  rpc: 'https://evm-rpc.testnet-2.nibiru.fi',
  chainId: '6911',
  symbol: 'NIBI',
};

export function LaunchpadConsole() {
  const [status, setStatus] = useState<NetworkState | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = window.localStorage.getItem('nibiru-launchpad-progress');
    if (!saved) return [];
    try { return JSON.parse(saved) as number[]; } catch { return []; }
  });
  const [copied, setCopied] = useState('');
  const [hash, setHash] = useState('');
  const [lookup, setLookup] = useState<{ tone: 'idle' | 'loading' | 'good' | 'bad'; message: string }>({ tone: 'idle', message: '' });

  const loadNetwork = async (refresh = true) => {
    if (refresh) setLoading(true);
    try {
      const response = await fetch('/api/network', { cache: 'no-store' });
      const payload = (await response.json()) as NetworkState;
      setStatus(payload);
    } catch {
      setStatus({ online: false, message: 'Live check is temporarily unavailable.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void fetch('/api/network', { cache: 'no-store' })
      .then((response) => response.json() as Promise<NetworkState>)
      .then((payload) => { if (active) setStatus(payload); })
      .catch(() => { if (active) setStatus({ online: false, message: 'Live check is temporarily unavailable.' }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const progress = useMemo(() => Math.round((completed.length / tasks.length) * 100), [completed]);

  const toggleTask = (index: number) => {
    const next = completed.includes(index) ? completed.filter((item) => item !== index) : [...completed, index];
    setCompleted(next);
    window.localStorage.setItem('nibiru-launchpad-progress', JSON.stringify(next));
  };

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1400);
  };

  const verifyTransaction = async () => {
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash.trim())) {
      setLookup({ tone: 'bad', message: 'Paste a valid transaction hash beginning with 0x.' });
      return;
    }

    setLookup({ tone: 'loading', message: 'Checking Nibiru Testnet 2…' });
    try {
      const response = await fetch('/api/network', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transactionHash: hash.trim() }),
      });
      const payload = await response.json() as { found?: boolean; message?: string; transaction?: { blockNumber?: number | null } };
      if (payload.found) {
        setLookup({ tone: 'good', message: `Verified${payload.transaction?.blockNumber ? ` in block ${payload.transaction.blockNumber.toLocaleString()}` : ' and waiting for a block'}.` });
      } else {
        setLookup({ tone: 'bad', message: payload.message || 'Transaction not found on this network.' });
      }
    } catch {
      setLookup({ tone: 'bad', message: 'The network lookup could not be completed. Try again shortly.' });
    }
  };

  return (
    <section id="live-lab" className="mt-8 grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
      <article className="network-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Live network pulse</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Nibiru Testnet 2</h2>
          </div>
          <button onClick={() => void loadNetwork(true)} className="icon-action" aria-label="Refresh network status">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="flex items-center gap-3">
            {loading ? <Loader2 className="size-5 animate-spin text-cyan-200" /> : status?.online ? <Wifi className="size-5 text-lime-200" /> : <WifiOff className="size-5 text-rose-300" />}
            <div>
              <p className="text-sm font-semibold">{loading ? 'Checking the network…' : status?.online ? 'Network is responding' : 'Live check unavailable'}</p>
              <p className="mt-1 text-xs text-white/45">
                {status?.online ? `Block ${status.latestBlock?.toLocaleString()} · ${status.latencyMs} ms` : status?.message || 'Trying the official RPC.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {[
            ['RPC URL', network.rpc],
            ['EVM chain ID', network.chainId],
            ['Currency symbol', network.symbol],
          ].map(([label, value]) => (
            <div key={label} className="copy-row">
              <div className="min-w-0">
                <span>{label}</span>
                <strong className="block truncate">{value}</strong>
              </div>
              <button onClick={() => void copyValue(label, value)} aria-label={`Copy ${label}`}>
                {copied === label ? <Check className="size-4 text-lime-200" /> : <Copy className="size-4" />}
              </button>
            </div>
          ))}
        </div>

        <a href="https://nibiru.fi/docs/dev/networks" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-cyan-200 hover:text-cyan-100">
          <ShieldCheck className="size-4" /> Verify in official network docs
        </a>
      </article>

      <article className="rounded-[30px] border border-white/10 bg-[#0d0f16]/90 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Your builder proof</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Finish the path, then verify it.</h2>
          </div>
          <div className="min-w-32">
            <div className="flex justify-between text-[11px] font-semibold text-white/45"><span>Progress</span><span>{progress}%</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-lime-300 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {tasks.map((task, index) => (
            <button key={task} onClick={() => toggleTask(index)} className={`task-button ${completed.includes(index) ? 'is-complete' : ''}`}>
              <span className="task-check">{completed.includes(index) && <Check className="size-3.5" />}</span>
              <span>{task}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <label htmlFor="transaction" className="text-xs font-semibold text-white/65">Verify a testnet transaction</label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input id="transaction" value={hash} onChange={(event) => setHash(event.target.value)} placeholder="0x…" className="hash-input" />
            <button onClick={() => void verifyTransaction()} disabled={lookup.tone === 'loading'} className="verify-button">
              {lookup.tone === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Verify
            </button>
          </div>
          {lookup.message && <p className={`mt-3 text-xs ${lookup.tone === 'good' ? 'text-lime-200' : lookup.tone === 'bad' ? 'text-rose-300' : 'text-white/45'}`}>{lookup.message}</p>}
        </div>
      </article>
    </section>
  );
}
