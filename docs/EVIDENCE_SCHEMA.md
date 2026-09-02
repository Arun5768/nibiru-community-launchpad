# Builder-proof receipt

The launchpad can export a JSON receipt after a user inspects a public Testnet 2 address or verifies a transaction.

## What the receipt contains

- Generation time and schema version.
- Nibiru Testnet 2 chain ID and RPC endpoint.
- The live network snapshot shown at generation time.
- Public address inspection results, when supplied.
- Public transaction details, when supplied.
- Whether the inspected address appears as the transaction sender or recipient.
- Locally completed workshop steps.

## What it does not prove

- The identity of the person who controls an address.
- Ownership of a private key.
- Completion of an official Nibiru course.
- Endorsement, certification, or affiliation with Nibiru.

## Privacy model

The receipt is assembled and downloaded in the browser. The project has no database and does not retain wallet addresses, transaction hashes, or checklist progress. Checklist state stays in local browser storage.

## Schema identifier

`nibiru-community-launchpad/builder-proof@1`

The receipt is deliberately human-readable so mentors and participants can inspect it without special software.
