# Pilot metrics dictionary

These definitions keep a small event report consistent and prevent registration
numbers from being presented as participation outcomes.

| Field | Definition | Collection rule |
|---|---|---|
| `registered_count` | People who completed the registration form | Count once per person; remove test entries |
| `attended_count` | People who joined the live session | Use check-in or platform attendance, not RSVP status |
| `correct_network_count` | Attendees who verified Testnet 2 chain ID `6911` | Record only the aggregate total |
| `public_tx_count` | Distinct public transaction hashes voluntarily shared for verification | Deduplicate hashes; never request private keys |
| `repo_count` | Public repositories shared through the seven-day follow-up | Count only accessible links related to the session |
| `documented_blocker_count` | Reproducible blockers with enough detail to triage | Exclude vague statements without a testable observation |
| `peer_helper_count` | Participants who safely helped another person complete a step | Record recognition only with consent |
| `day_7_return_count` | Attendees who complete a follow-up action within seven days | Define the action before the session |

## Useful rates

- **Attendance rate:** `attended_count / registered_count`
- **Network completion rate:** `correct_network_count / attended_count`
- **Seven-day return rate:** `day_7_return_count / attended_count`

When a denominator is zero, report the rate as “not available.” Do not quietly
change the definition between sessions to make a result look stronger.

## Privacy boundary

The public retrospective should contain aggregate counts and voluntarily shared
public artifacts. The working sheet must not contain seed phrases, private keys,
wallet balances, unnecessary wallet addresses, or sensitive personal notes.
