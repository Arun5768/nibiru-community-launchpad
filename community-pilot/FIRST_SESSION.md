# First session: debug your first Nibiru transaction

## Format

- **Length:** 60 minutes
- **Room:** 20–40 participants
- **Team:** one host, one technical facilitator, and one helper per 10–12 people
- **Audience:** developers who can use a browser and read basic code; prior Nibiru experience is not required
- **Network:** Nibiru Testnet 2 only

## Promise to participants

This is not a token-promotion session. Participants learn how to verify a
network, read a transaction receipt, describe a failure safely, and continue
building without depending on a presenter.

## Run of show

| Time | Activity | Observable outcome |
|---|---|---|
| 00–05 | Welcome, scope, and safety | Everyone knows what must never be shared |
| 05–12 | What Nibiru is and where EVM fits | Participants can explain the chosen network |
| 12–20 | Configure and verify Testnet 2 | Correct chain ID appears in each pair |
| 20–32 | Complete or inspect one public transaction | Hash and receipt state are understood |
| 32–45 | Debug Desk paired challenge | Each pair diagnoses one prepared symptom |
| 45–52 | Blocker wall | Problems are grouped by docs, tooling, network, or concept |
| 52–57 | Two participant explanations | Peers, not only the host, teach the room |
| 57–60 | Seven-day next step | Every interested builder chooses one small follow-up |

## Prepared challenge cards

1. **Wrong chain:** the wallet is connected, but the chain ID is not `6911`.
2. **Missing transaction:** a hash cannot be found. Decide whether it was broadcast.
3. **Reverted transaction:** the receipt exists, but execution failed.
4. **Wrong address type:** the frontend expects a contract but receives a wallet.
5. **Incomplete support request:** turn “it failed” into a reproducible report.

## Room roles

- **Host:** keeps the promise, timing, and community tone clear.
- **Technical facilitator:** validates the demonstration against current official documentation before the session.
- **Helpers:** unblock pairs without requesting private information or taking control of wallets.
- **Evidence owner:** records anonymous totals and recurring blockers; never collects keys, balances, or unnecessary personal data.

## Before opening registration

- Recheck the current network configuration in the official Nibiru documentation.
- Run `pnpm verify:nibiru` from this repository.
- Test the venue or streaming connection from the actual network participants will use.
- Prepare a fallback screenshot and sample public hash in case testnet access is interrupted.
- State clearly whether the session is independent or officially supported.

## After the session

Within 48 hours, send the follow-up template. Within seven days, record public
repositories or documented blockers shared voluntarily. Publish a retrospective
even when an outcome was weaker than expected.
