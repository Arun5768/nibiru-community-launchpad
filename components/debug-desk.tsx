'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Loader2,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  WalletCards,
  XCircle,
} from 'lucide-react';

type NetworkState = {
  online: boolean;
  rpcUrl?: string;
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

type AddressResult = {
  verified: boolean;
  address: string;
  balanceNibi: string;
  nonce: number;
  accountType: string;
  bytecodeBytes: number;
  explorerUrl: string;
  checkedAt: string;
};

type TransactionResult = {
  found: boolean;
  state: 'not_found' | 'pending' | 'success' | 'reverted';
  diagnosis: string;
  nextSteps: string[];
  explorerUrl: string;
  transaction?: {
    hash: string;
    from?: string;
    to?: string | null;
    blockNumber?: number | null;
    confirmations?: number;
    valueNibi?: string;
    gasLimit?: number | null;
    gasUsed?: number | null;
    effectiveGasPriceGwei?: string | null;
    transactionCostNibi?: string | null;
    logsCount?: number;
    contractAddress?: string | null;
  };
};

type Notice = { tone: 'idle' | 'loading' | 'good' | 'bad'; message: string };

const issueGuides = {
  wrong_network: {
    label: 'Wallet shows the wrong network',
    checks: [
      'Confirm the wallet network is Nibiru Testnet 2.',
      'Use EVM chain ID 6911 (hex 0x1AFF).',
      'Replace any deprecated testnet RPC with the current official endpoint.',
      'Reload the dApp after switching networks.',
    ],
  },
  pending: {
    label: 'Transaction stays pending',
    checks: [
      'Look up the hash below. If it is not found, the wallet may not have broadcast it.',
      'Check whether an earlier transaction from the same wallet is still pending.',
      'Do not repeatedly resend unless you understand nonce replacement.',
      'Record the wallet, time, nonce, and hash before asking for help.',
    ],
  },
  reverted: {
    label: 'Transaction reverted',
    checks: [
      'A reverted receipt means the network processed the transaction but contract execution failed.',
      'Confirm the contract address and selected network.',
      'Capture the called function, public inputs, and exact UI error.',
      'The receipt alone cannot reveal every contract-specific reason; share a reproducible case.',
    ],
  },
  contract: {
    label: 'Contract is not found',
    checks: [
      'Inspect the address below and confirm it is reported as a smart contract.',
      'Verify the deployment transaction completed on Testnet 2.',
      'Check that the frontend uses the same deployed address and ABI.',
      'If the address is a wallet, the contract is missing on this network.',
    ],
  },
  rpc: {
    label: 'RPC, timeout, or connection error',
    checks: [
      'Refresh the live network check and note its latency and latest block age.',
      'Compare your configured RPC with the official Testnet 2 endpoint.',
      'Try a clean browser session to rule out a stale wallet connection.',
      'Share the exact method, timestamp, and sanitized error—never credentials.',
    ],
  },
};

const config = {
  rpc: 'https://evm-rpc.testnet-2.nibiru.fi',
};

function shortValue(value?: string | null) {
  if (!value) return '—';
  if (value.length < 22) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

function statusClass(state?: TransactionResult['state']) {
  if (state === 'success') return 'status-good';
  if (state === 'pending') return 'status-warn';
  return 'status-bad';
}

export function DebugDesk() {
  const [network, setNetwork] = useState<NetworkState | null>(null);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [addressResult, setAddressResult] = useState<AddressResult | null>(
    null,
  );
  const [addressNotice, setAddressNotice] = useState<Notice>({
    tone: 'idle',
    message: '',
  });
  const [hash, setHash] = useState('');
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult | null>(null);
  const [transactionNotice, setTransactionNotice] = useState<Notice>({
    tone: 'idle',
    message: '',
  });
  const [issue, setIssue] = useState<keyof typeof issueGuides>('wrong_network');
  const [observed, setObserved] = useState('');
  const [steps, setSteps] = useState('');
  const [copied, setCopied] = useState('');

  const loadNetwork = async () => {
    setNetworkLoading(true);
    try {
      const response = await fetch('/api/network', { cache: 'no-store' });
      setNetwork((await response.json()) as NetworkState);
    } catch {
      setNetwork({
        online: false,
        message: 'The live check could not reach the RPC.',
      });
    } finally {
      setNetworkLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void fetch('/api/network', { cache: 'no-store' })
      .then((response) => response.json() as Promise<NetworkState>)
      .then((payload) => {
        if (active) setNetwork(payload);
      })
      .catch(() => {
        if (active)
          setNetwork({
            online: false,
            message: 'The live check could not reach the RPC.',
          });
      })
      .finally(() => {
        if (active) setNetworkLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const inspectAddress = async () => {
    const clean = address.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      setAddressNotice({
        tone: 'bad',
        message: 'Enter a valid 42-character EVM address.',
      });
      return;
    }
    setAddressNotice({
      tone: 'loading',
      message: 'Reading public Testnet 2 state…',
    });
    try {
      const response = await fetch('/api/address', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address: clean }),
      });
      const payload = (await response.json()) as AddressResult & {
        message?: string;
      };
      if (!response.ok)
        throw new Error(payload.message || 'Address lookup failed.');
      setAddressResult(payload);
      setAddressNotice({
        tone: 'good',
        message: `${payload.accountType} found on Nibiru Testnet 2.`,
      });
    } catch (error) {
      setAddressResult(null);
      setAddressNotice({
        tone: 'bad',
        message:
          error instanceof Error ? error.message : 'Address lookup failed.',
      });
    }
  };

  const inspectTransaction = async () => {
    const clean = hash.trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(clean)) {
      setTransactionNotice({
        tone: 'bad',
        message: 'Enter a valid 66-character transaction hash.',
      });
      return;
    }
    setTransactionNotice({
      tone: 'loading',
      message: 'Checking the transaction and receipt…',
    });
    try {
      const response = await fetch('/api/network', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transactionHash: clean }),
      });
      const payload = (await response.json()) as TransactionResult & {
        message?: string;
      };
      if (!response.ok)
        throw new Error(payload.message || 'Transaction lookup failed.');
      setTransactionResult(payload);
      setTransactionNotice({
        tone:
          payload.state === 'success'
            ? 'good'
            : payload.state === 'reverted'
              ? 'bad'
              : 'idle',
        message: payload.diagnosis,
      });
    } catch (error) {
      setTransactionResult(null);
      setTransactionNotice({
        tone: 'bad',
        message:
          error instanceof Error ? error.message : 'Transaction lookup failed.',
      });
    }
  };

  const report = useMemo(() => {
    const lines = [
      '# Nibiru Testnet 2 support report',
      '',
      `Network checked: ${network?.checkedAt ?? 'Run the network check to capture a timestamp'}`,
      `Issue: ${issueGuides[issue].label}`,
      '',
      '## Network',
      `- RPC reachable: ${network?.online ? 'Yes' : 'No'}`,
      `- Chain ID: ${network?.chainId ?? 'Unavailable'} (expected 6911)`,
      `- Latest block: ${network?.latestBlock ?? 'Unavailable'}`,
      `- Block age: ${network?.blockAgeSeconds ?? 'Unavailable'} seconds`,
      `- RPC latency: ${network?.latencyMs ?? 'Unavailable'} ms`,
      `- Client: ${network?.client ?? 'Unavailable'}`,
    ];
    if (addressResult)
      lines.push(
        '',
        '## Public address',
        `- Address: ${addressResult.address}`,
        `- Type: ${addressResult.accountType}`,
        `- Balance: ${addressResult.balanceNibi} NIBI`,
        `- Nonce: ${addressResult.nonce}`,
      );
    if (transactionResult)
      lines.push(
        '',
        '## Transaction',
        `- Hash: ${transactionResult.transaction?.hash ?? hash.trim()}`,
        `- State: ${transactionResult.state}`,
        `- Diagnosis: ${transactionResult.diagnosis}`,
        `- Block: ${transactionResult.transaction?.blockNumber ?? 'Not included'}`,
        `- Confirmations: ${transactionResult.transaction?.confirmations ?? 0}`,
      );
    lines.push(
      '',
      '## What happened',
      observed.trim() || 'Not provided',
      '',
      '## Steps to reproduce',
      steps.trim() || 'Not provided',
      '',
      '## Safety',
      '- No seed phrase, private key, or secret was included.',
      '',
      '_Prepared with Nibiru Debug Desk, an independent community utility._',
    );
    return lines.join('\n');
  }, [addressResult, hash, issue, network, observed, steps, transactionResult]);

  const copyText = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1600);
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nibiru-support-report-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const guide = issueGuides[issue];

  return (
    <section className="desk" aria-label="Nibiru troubleshooting workspace">
      <aside className="desk-sidebar">
        <p className="sidebar-label">Diagnostic flow</p>
        <ol>
          <li className="active">
            <span>1</span>
            <div>
              <strong>Network</strong>
              <small>Confirm the connection</small>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Public data</strong>
              <small>Inspect address or tx</small>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Issue guide</strong>
              <small>Narrow the cause</small>
            </div>
          </li>
          <li>
            <span>4</span>
            <div>
              <strong>Support report</strong>
              <small>Share useful evidence</small>
            </div>
          </li>
        </ol>
        <div className="config-card">
          <span>Official testnet config</span>
          <dl>
            <div>
              <dt>Chain ID</dt>
              <dd>6911</dd>
            </div>
            <div>
              <dt>Hex</dt>
              <dd>0x1AFF</dd>
            </div>
            <div>
              <dt>Currency</dt>
              <dd>NIBI</dd>
            </div>
          </dl>
          <button onClick={() => void copyText('rpc', config.rpc)}>
            {copied === 'rpc' ? <Check /> : <Copy />}
            {copied === 'rpc' ? 'Copied RPC' : 'Copy RPC URL'}
          </button>
        </div>
      </aside>

      <div className="desk-main">
        <section className="tool-section" aria-labelledby="network-heading">
          <div className="section-heading">
            <div>
              <span className="section-number">01</span>
              <div>
                <h2 id="network-heading">Network health</h2>
                <p>Live data from the official Nibiru Testnet 2 EVM RPC.</p>
              </div>
            </div>
            <button
              className="quiet-button"
              onClick={() => void loadNetwork()}
              disabled={networkLoading}
            >
              <RefreshCw className={networkLoading ? 'spin' : ''} /> Refresh
            </button>
          </div>
          <div className="health-grid">
            <article className="health-primary">
              <div
                className={`health-icon ${network?.online ? 'online' : 'offline'}`}
              >
                {networkLoading ? (
                  <Loader2 className="spin" />
                ) : network?.online ? (
                  <CheckCircle2 />
                ) : (
                  <XCircle />
                )}
              </div>
              <div>
                <span>RPC status</span>
                <strong>
                  {networkLoading
                    ? 'Checking…'
                    : network?.online
                      ? 'Operational'
                      : 'Unavailable'}
                </strong>
                <small>
                  {network?.online
                    ? 'The endpoint returned current chain data.'
                    : network?.message || 'Try again shortly.'}
                </small>
              </div>
            </article>
            <article className="metric-box">
              <Server />
              <span>Latest block</span>
              <strong>{network?.latestBlock?.toLocaleString() ?? '—'}</strong>
              <small>{network?.blockAgeSeconds ?? '—'} sec old</small>
            </article>
            <article className="metric-box">
              <Gauge />
              <span>Latency</span>
              <strong>{network?.latencyMs ?? '—'} ms</strong>
              <small>
                {network && (network.latencyMs ?? 9999) < 1200
                  ? 'Normal response'
                  : 'Check again'}
              </small>
            </article>
            <article className="metric-box">
              <Activity />
              <span>Chain ID</span>
              <strong>{network?.chainId ?? '—'}</strong>
              <small>
                {network?.networkVerified
                  ? 'Matches Testnet 2'
                  : 'Expected 6911'}
              </small>
            </article>
          </div>
        </section>

        <section className="tool-section" aria-labelledby="inspect-heading">
          <div className="section-heading">
            <div>
              <span className="section-number">02</span>
              <div>
                <h2 id="inspect-heading">Inspect public chain data</h2>
                <p>No wallet connection or signature required.</p>
              </div>
            </div>
          </div>
          <div className="inspect-grid">
            <article className="inspect-card">
              <div className="card-title">
                <WalletCards />
                <div>
                  <h3>Address inspector</h3>
                  <p>Verify balance, nonce, and account type.</p>
                </div>
              </div>
              <label htmlFor="address">Wallet or contract address</label>
              <div className="input-row">
                <input
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="0x…"
                  spellCheck={false}
                />
                <button
                  onClick={() => void inspectAddress()}
                  disabled={addressNotice.tone === 'loading'}
                >
                  {addressNotice.tone === 'loading' ? (
                    <Loader2 className="spin" />
                  ) : (
                    <Search />
                  )}{' '}
                  Inspect
                </button>
              </div>
              {addressNotice.message && (
                <p className={`notice notice-${addressNotice.tone}`}>
                  {addressNotice.message}
                </p>
              )}
              {addressResult && (
                <div className="result-table">
                  <div>
                    <span>Type</span>
                    <strong>{addressResult.accountType}</strong>
                  </div>
                  <div>
                    <span>Balance</span>
                    <strong>{addressResult.balanceNibi} NIBI</strong>
                  </div>
                  <div>
                    <span>Nonce</span>
                    <strong>{addressResult.nonce}</strong>
                  </div>
                  {addressResult.accountType === 'Smart contract' && (
                    <div>
                      <span>Bytecode</span>
                      <strong>
                        {addressResult.bytecodeBytes.toLocaleString()} bytes
                      </strong>
                    </div>
                  )}
                  <a
                    href={addressResult.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in explorer <ExternalLink />
                  </a>
                </div>
              )}
            </article>

            <article className="inspect-card">
              <div className="card-title">
                <Clipboard />
                <div>
                  <h3>Transaction debugger</h3>
                  <p>Read inclusion, receipt, cost, and likely state.</p>
                </div>
              </div>
              <label htmlFor="transaction">Transaction hash</label>
              <div className="input-row">
                <input
                  id="transaction"
                  value={hash}
                  onChange={(event) => setHash(event.target.value)}
                  placeholder="0x…"
                  spellCheck={false}
                />
                <button
                  onClick={() => void inspectTransaction()}
                  disabled={transactionNotice.tone === 'loading'}
                >
                  {transactionNotice.tone === 'loading' ? (
                    <Loader2 className="spin" />
                  ) : (
                    <Search />
                  )}{' '}
                  Debug
                </button>
              </div>
              {transactionNotice.message && (
                <p className={`notice notice-${transactionNotice.tone}`}>
                  {transactionNotice.message}
                </p>
              )}
              {transactionResult && (
                <div className="transaction-result">
                  <span
                    className={`state-pill ${statusClass(transactionResult.state)}`}
                  >
                    {transactionResult.state.replace('_', ' ')}
                  </span>
                  {transactionResult.transaction && (
                    <div className="result-table compact">
                      <div>
                        <span>Block</span>
                        <strong>
                          {transactionResult.transaction.blockNumber?.toLocaleString() ??
                            'Pending'}
                        </strong>
                      </div>
                      <div>
                        <span>Confirmations</span>
                        <strong>
                          {transactionResult.transaction.confirmations ?? 0}
                        </strong>
                      </div>
                      <div>
                        <span>From</span>
                        <strong title={transactionResult.transaction.from}>
                          {shortValue(transactionResult.transaction.from)}
                        </strong>
                      </div>
                      <div>
                        <span>To</span>
                        <strong title={transactionResult.transaction.to ?? ''}>
                          {shortValue(transactionResult.transaction.to)}
                        </strong>
                      </div>
                      <div>
                        <span>Gas used</span>
                        <strong>
                          {transactionResult.transaction.gasUsed?.toLocaleString() ??
                            '—'}
                        </strong>
                      </div>
                      <div>
                        <span>Network cost</span>
                        <strong>
                          {transactionResult.transaction.transactionCostNibi ??
                            '—'}{' '}
                          NIBI
                        </strong>
                      </div>
                    </div>
                  )}
                  <ul>
                    {transactionResult.nextSteps.map((step) => (
                      <li key={step}>
                        <ChevronRight />
                        {step}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={transactionResult.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in explorer <ExternalLink />
                  </a>
                </div>
              )}
            </article>
          </div>
        </section>

        <section className="tool-section" aria-labelledby="guide-heading">
          <div className="section-heading">
            <div>
              <span className="section-number">03</span>
              <div>
                <h2 id="guide-heading">Issue guide</h2>
                <p>Choose the closest symptom and work through the checks.</p>
              </div>
            </div>
          </div>
          <div className="guide-layout">
            <div>
              <label htmlFor="issue">What are you seeing?</label>
              <select
                id="issue"
                value={issue}
                onChange={(event) =>
                  setIssue(event.target.value as keyof typeof issueGuides)
                }
              >
                {Object.entries(issueGuides).map(([value, item]) => (
                  <option key={value} value={value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="warning-box">
                <ShieldAlert />
                <p>
                  Share public addresses and transaction hashes only. Support
                  staff never need your seed phrase or private key.
                </p>
              </div>
            </div>
            <ol className="checklist">
              {guide.checks.map((item, index) => (
                <li key={item}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="tool-section" aria-labelledby="report-heading">
          <div className="section-heading">
            <div>
              <span className="section-number">04</span>
              <div>
                <h2 id="report-heading">Build a support report</h2>
                <p>
                  Turn checks into a reproducible, maintainer-friendly report.
                </p>
              </div>
            </div>
            <FileText />
          </div>
          <div className="report-grid">
            <div className="report-fields">
              <label htmlFor="observed">What happened?</label>
              <textarea
                id="observed"
                value={observed}
                onChange={(event) => setObserved(event.target.value)}
                placeholder="Expected X, but saw Y. Include the exact public error text."
              />
              <label htmlFor="steps">Steps to reproduce</label>
              <textarea
                id="steps"
                value={steps}
                onChange={(event) => setSteps(event.target.value)}
                placeholder={'1. Opened…\n2. Selected…\n3. Submitted…'}
              />
              <div className="report-actions">
                <button
                  className="primary-button"
                  onClick={() => void copyText('report', report)}
                >
                  {copied === 'report' ? <Check /> : <Copy />}
                  {copied === 'report' ? 'Copied report' : 'Copy report'}
                </button>
                <button className="secondary-button" onClick={downloadReport}>
                  <Download /> Download .md
                </button>
              </div>
            </div>
            <pre
              className="report-preview"
              aria-label="Generated report preview"
            >
              {report}
            </pre>
          </div>
        </section>
      </div>
    </section>
  );
}
