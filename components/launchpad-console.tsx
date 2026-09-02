'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  WalletCards,
  Wifi,
  WifiOff,
} from 'lucide-react';

type NetworkState = {
  online: boolean;
  chainId?: number | null;
  latestBlock?: number | null;
  client?: string;
  latencyMs?: number;
  blockAgeSeconds?: number | null;
  gasPriceGwei?: number | null;
  networkVerified?: boolean;
  syncing?: boolean;
  checkedAt?: string;
  message?: string;
};

type AddressProof = {
  verified: boolean;
  address: string;
  balanceNibi: string;
  nonce: number;
  accountType: string;
  explorerUrl: string;
  checkedAt: string;
};

type TransactionProof = {
  hash: string;
  from?: string;
  to?: string;
  blockNumber?: number | null;
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
    try {
      return JSON.parse(saved) as number[];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState('');
  const [address, setAddress] = useState('');
  const [addressProof, setAddressProof] = useState<AddressProof | null>(null);
  const [addressLookup, setAddressLookup] = useState<{
    tone: 'idle' | 'loading' | 'good' | 'bad';
    message: string;
  }>({ tone: 'idle', message: '' });
  const [hash, setHash] = useState('');
  const [transactionProof, setTransactionProof] =
    useState<TransactionProof | null>(null);
  const [lookup, setLookup] = useState<{
    tone: 'idle' | 'loading' | 'good' | 'bad';
    message: string;
  }>({ tone: 'idle', message: '' });

  const loadNetwork = async (refresh = true) => {
    if (refresh) setLoading(true);
    try {
      const response = await fetch('/api/network', { cache: 'no-store' });
      const payload = (await response.json()) as NetworkState;
      setStatus(payload);
    } catch {
      setStatus({
        online: false,
        message: 'Live check is temporarily unavailable.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void fetch('/api/network', { cache: 'no-store' })
      .then((response) => response.json() as Promise<NetworkState>)
      .then((payload) => {
        if (active) setStatus(payload);
      })
      .catch(() => {
        if (active)
          setStatus({
            online: false,
            message: 'Live check is temporarily unavailable.',
          });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const progress = useMemo(
    () => Math.round((completed.length / tasks.length) * 100),
    [completed],
  );

  const toggleTask = (index: number) => {
    const next = completed.includes(index)
      ? completed.filter((item) => item !== index)
      : [...completed, index];
    setCompleted(next);
    window.localStorage.setItem(
      'nibiru-launchpad-progress',
      JSON.stringify(next),
    );
  };

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1400);
  };

  const verifyTransaction = async () => {
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash.trim())) {
      setLookup({
        tone: 'bad',
        message: 'Paste a valid transaction hash beginning with 0x.',
      });
      return;
    }

    setLookup({ tone: 'loading', message: 'Checking Nibiru Testnet 2…' });
    try {
      const response = await fetch('/api/network', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transactionHash: hash.trim() }),
      });
      const payload = (await response.json()) as {
        found?: boolean;
        message?: string;
        transaction?: { blockNumber?: number | null };
      };
      if (payload.found) {
        setTransactionProof(payload.transaction as TransactionProof);
        setLookup({
          tone: 'good',
          message: `Verified${payload.transaction?.blockNumber ? ` in block ${payload.transaction.blockNumber.toLocaleString()}` : ' and waiting for a block'}.`,
        });
      } else {
        setTransactionProof(null);
        setLookup({
          tone: 'bad',
          message: payload.message || 'Transaction not found on this network.',
        });
      }
    } catch {
      setLookup({
        tone: 'bad',
        message:
          'The network lookup could not be completed. Try again shortly.',
      });
    }
  };

  const inspectAddress = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setAddressLookup({
        tone: 'bad',
        message: 'Paste a valid EVM wallet or contract address.',
      });
      return;
    }

    setAddressLookup({
      tone: 'loading',
      message: 'Reading public Testnet 2 state…',
    });
    try {
      const response = await fetch('/api/address', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });
      const payload = (await response.json()) as AddressProof & {
        message?: string;
      };
      if (!response.ok)
        throw new Error(payload.message || 'Address lookup failed.');
      setAddressProof(payload);
      setAddressLookup({
        tone: 'good',
        message: `${payload.accountType} verified on Nibiru Testnet 2.`,
      });
    } catch (error) {
      setAddressProof(null);
      setAddressLookup({
        tone: 'bad',
        message:
          error instanceof Error ? error.message : 'Address lookup failed.',
      });
    }
  };

  const downloadReceipt = () => {
    const normalizedAddress = addressProof?.address.toLowerCase();
    const addressLinkedToTransaction = Boolean(
      normalizedAddress &&
      transactionProof &&
      [transactionProof.from, transactionProof.to].some(
        (value) => value?.toLowerCase() === normalizedAddress,
      ),
    );
    const receipt = {
      schema: 'nibiru-community-launchpad/builder-proof@1',
      generatedAt: new Date().toISOString(),
      network: {
        name: network.name,
        chainId: Number(network.chainId),
        rpc: network.rpc,
        liveStatusAtGeneration: status,
      },
      participantProof: {
        address: addressProof,
        transaction: transactionProof,
        addressLinkedToTransaction,
        completedTasks: tasks.filter((_, index) => completed.includes(index)),
        completionPercent: progress,
      },
      verification: {
        explorer: 'https://testnet.nibiscan.io',
        generatedBy:
          'https://nibiru-community-launchpad.arunchandel1780.workers.dev',
        note: 'This is a locally generated evidence receipt, not an official Nibiru credential.',
      },
    };
    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nibiru-builder-proof-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="live-lab"
      className="mt-8 grid gap-5 lg:grid-cols-[.82fr_1.18fr]"
    >
      <article className="network-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Live network pulse</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Nibiru Testnet 2
            </h2>
          </div>
          <button
            onClick={() => void loadNetwork(true)}
            className="icon-action"
            aria-label="Refresh network status"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="size-5 animate-spin text-cyan-200" />
            ) : status?.online ? (
              <Wifi className="size-5 text-lime-200" />
            ) : (
              <WifiOff className="size-5 text-rose-300" />
            )}
            <div>
              <p className="text-sm font-semibold">
                {loading
                  ? 'Checking the network…'
                  : status?.online
                    ? 'Network is responding'
                    : 'Live check unavailable'}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {status?.online
                  ? `Block ${status.latestBlock?.toLocaleString()} · ${status.blockAgeSeconds ?? '—'}s old · ${status.latencyMs} ms`
                  : status?.message || 'Trying the official RPC.'}
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
              <button
                onClick={() => void copyValue(label, value)}
                aria-label={`Copy ${label}`}
              >
                {copied === label ? (
                  <Check className="size-4 text-lime-200" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          ))}
        </div>

        <a
          href="https://nibiru.fi/docs/dev/networks"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-cyan-200 hover:text-cyan-100"
        >
          <ShieldCheck className="size-4" /> Verify in official network docs
        </a>
      </article>

      <article className="rounded-[30px] border border-white/10 bg-[#0d0f16]/90 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Your builder proof</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Finish the path, then verify it.
            </h2>
          </div>
          <div className="min-w-32">
            <div className="flex justify-between text-[11px] font-semibold text-white/45">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-lime-300 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {tasks.map((task, index) => (
            <button
              key={task}
              onClick={() => toggleTask(index)}
              className={`task-button ${completed.includes(index) ? 'is-complete' : ''}`}
            >
              <span className="task-check">
                {completed.includes(index) && <Check className="size-3.5" />}
              </span>
              <span>{task}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-5">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="address"
                className="text-xs font-semibold text-white/65"
              >
                Inspect a public Testnet 2 address
              </label>
              <WalletCards className="size-4 text-cyan-200" />
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="0x wallet or contract address"
                className="hash-input"
              />
              <button
                onClick={() => void inspectAddress()}
                disabled={addressLookup.tone === 'loading'}
                className="verify-button"
              >
                {addressLookup.tone === 'loading' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}{' '}
                Inspect
              </button>
            </div>
            {addressLookup.message && (
              <p
                className={`mt-3 text-xs ${addressLookup.tone === 'good' ? 'text-lime-200' : addressLookup.tone === 'bad' ? 'text-rose-300' : 'text-white/45'}`}
              >
                {addressLookup.message}
              </p>
            )}
            {addressProof && (
              <div className="proof-result">
                <span>
                  <strong>{addressProof.balanceNibi}</strong> NIBI
                </span>
                <span>
                  <strong>{addressProof.nonce}</strong> transactions
                </span>
                <a
                  href={addressProof.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explorer <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-5">
            <label
              htmlFor="transaction"
              className="text-xs font-semibold text-white/65"
            >
              Verify a testnet transaction
            </label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                id="transaction"
                value={hash}
                onChange={(event) => setHash(event.target.value)}
                placeholder="0x…"
                className="hash-input"
              />
              <button
                onClick={() => void verifyTransaction()}
                disabled={lookup.tone === 'loading'}
                className="verify-button"
              >
                {lookup.tone === 'loading' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}{' '}
                Verify
              </button>
            </div>
            {lookup.message && (
              <p
                className={`mt-3 text-xs ${lookup.tone === 'good' ? 'text-lime-200' : lookup.tone === 'bad' ? 'text-rose-300' : 'text-white/45'}`}
              >
                {lookup.message}
              </p>
            )}
          </div>

          {(addressProof || transactionProof) && (
            <button onClick={downloadReceipt} className="receipt-button">
              <Download className="size-4" /> Download builder-proof receipt
            </button>
          )}
          <p className="mt-3 text-[10px] leading-4 text-white/30">
            Public-chain data only. The receipt is local evidence, not an
            official credential.
          </p>
        </div>
      </article>
    </section>
  );
}
