# Nibiru Community Launchpad

[![Live on Cloudflare](https://img.shields.io/badge/live-Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://nibiru-community-launchpad.arunchandel1780.workers.dev/)
[![Nibiru Testnet 2](https://img.shields.io/badge/Nibiru-Testnet%202-74E6ED)](https://testnet.nibiscan.io/)
[![Independent proof of work](https://img.shields.io/badge/status-independent%20proof%20of%20work-BEF264)](#safety-and-attribution)

An independent, testnet-first product that helps a new builder move from curiosity to public, verifiable evidence on Nibiru.

**[Open the live launchpad](https://nibiru-community-launchpad.arunchandel1780.workers.dev/)** · **[Read the technical case study](docs/TECHNICAL_CASE_STUDY.md)** · **[Use the facilitator playbook](docs/FACILITATOR_PLAYBOOK.md)**

![Nibiru Community Launchpad live interface](docs/assets/launchpad-live.png)

## Why this exists

Many onboarding events measure registrations and impressions. This project measures completed wallet setup, public transactions, build artifacts, and follow-up. It is both a working developer tool and a reusable community operating kit.

## Proof package

| Artifact                 | What can be verified                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Live network diagnostics | Testnet 2 chain ID, latest block, block age, gas price, client, sync state, and latency |
| Public address inspector | Balance, nonce, wallet/contract classification, and explorer link                       |
| Transaction verifier     | Transaction existence and block number using the official JSON-RPC endpoint             |
| Builder-proof receipt    | Human-readable JSON connecting public evidence with locally completed tasks             |
| Verification script      | Repeatable command-line assertions against the live network                             |
| Facilitator playbook     | A 90-minute lab, safety script, metrics, and 30-day follow-up loop                      |

## Repository map

- [`app/api/network/route.ts`](app/api/network/route.ts) — server-side network diagnostics and transaction lookup.
- [`app/api/address/route.ts`](app/api/address/route.ts) — public address inspection.
- [`scripts/verify-network.mjs`](scripts/verify-network.mjs) — independent network verification.
- [`docs/TECHNICAL_CASE_STUDY.md`](docs/TECHNICAL_CASE_STUDY.md) — architecture and decisions.
- [`docs/FACILITATOR_PLAYBOOK.md`](docs/FACILITATOR_PLAYBOOK.md) — event operating system.
- [`docs/EVIDENCE_SCHEMA.md`](docs/EVIDENCE_SCHEMA.md) — receipt data and limitations.
- [`docs/CONTRIBUTION_MAP.md`](docs/CONTRIBUTION_MAP.md) — responsible upstream-feedback path.
- [`evidence/network-check.latest.json`](evidence/network-check.latest.json) — dated machine-readable verification output.

## Verify it yourself

```bash
pnpm install
pnpm verify:nibiru
pnpm lint
pnpm build
```

## Community rollout

The first pilot is designed for 25–40 selected builders in Indore. The improved curriculum then runs in Bhopal before becoming a lightweight city playbook for trusted organizers. Success is defined by verified outputs and 30-day contributor retention—not attendance alone.

## Safety and attribution

This is independent proof of work by [Arun Chandel](https://github.com/Arun5768). It is not affiliated with or endorsed by Nibiru.

- Never enter a seed phrase or private key.
- Use testnet accounts only.
- Testnet tokens have no monetary value.
- The application stores no wallet or transaction data.
- Verify network details against the [official Nibiru Developer Hub](https://nibiru.fi/docs/dev).
