# Support-report evidence model

Debug Desk produces a human-readable Markdown report for a maintainer, issue tracker, or community support channel.

## Included when available

- Network check timestamp, RPC reachability, chain ID, latest block, block age, latency, and client.
- Public address, account type, Testnet 2 balance, and nonce.
- Public transaction hash, state, diagnosis, block, and confirmation count.
- The selected symptom, observed behavior, and user-written reproduction steps.
- An explicit reminder that no private credential should be included.

## Not collected

- Seed phrases, private keys, passwords, access tokens, or signatures.
- Wallet connection data or proof of address ownership.
- Browser identity, analytics, or a server-side copy of the report.

## What the report proves

It records public chain observations and user-supplied reproduction context. It does not prove identity, ownership, an exact smart-contract revert reason, or any endorsement by Nibiru.

## Recommended support use

1. Remove anything sensitive from the free-text fields.
2. Re-run the network and public-data checks immediately before export.
3. Paste the Markdown into the relevant support channel or issue.
4. Add source code, ABI, or trace details only when the maintainer requests them and they are safe to share.
