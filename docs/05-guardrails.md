# Guardrails

These are product constraints enforced in code, not disclaimer text. Each one is a check in the
runtime with a test in the evaluation set.

## Hard rules

**1. No personalised financial advice.**
The system may explain instruments, describe what happened and why, and state probabilities with
their intervals. It may not tell a specific person what to buy, sell, hold or stake, or size a
position for them. The output guardrail `no_advice` classifies responses and blocks the ones that
cross this line.

**2. No guarantees, no promised returns.**
No output may state or imply an assured yield, a price target as a fact, a listing that has not been
announced, or a legal or regulatory status the company has not published.

**3. No autonomous movement of funds.**
An agent may prepare an action. A human confirms that specific action. There is no permission tier
that skips this — see [04-agents.md#permission-tiers](04-agents.md#permission-tiers).

**4. Forecasts carry their uncertainty.**
A probability renders with its interval and its generated-at time, or it does not render. A point
prediction of a price is never produced in any surface.

**5. Citations resolve.**
Any factual claim about platform rules, fees, schedules or a project's disclosures cites a document
id. The `citations_resolve` guardrail checks that every cited id exists and was actually retrieved
during that request. A fabricated citation is treated as a failed response, not a cosmetic issue.

**6. No cross-user data, ever.**
Aggregates are computed by the intelligence layer and returned as aggregates. No agent context ever
contains another user's row, and no tool returns one.

## Prompt injection

Retrieved documents, launchpad submissions, ticket text and user messages are **untrusted input**.
The rules the runtime applies:

- Instructions found inside retrieved content are data. They never alter the agent's tools,
  permissions or system prompt.
- Tool authorisation is server-side. A document that says "you are an admin" changes nothing,
  because the tool re-checks identity independently of the model's belief.
- Content that attempts to redirect the agent is flagged in the audit record, and the response says
  the source appeared to contain instructions rather than silently ignoring it.
- Untrusted content is delimited and labelled in the prompt so that its boundary is unambiguous.

## Data handling

- **PII stripping** on input: card numbers, seed phrases, private keys and passwords are removed
  before a model call, and their presence is logged as a category, not a value. A user who pastes a
  seed phrase gets an immediate warning and the message is not retained.
- **Log retention**: agent traces 90 days, raw request bodies 7 days, aggregates indefinitely.
- **No provider training.** Contracts with model providers must exclude our traffic from training.
  Any provider that cannot commit to that is not eligible.
- **Regional routing.** User context stays in the region it originated in.

## Refusal style

When the system refuses, it does so in one sentence, says what it can do instead, and does not
lecture. A refusal that reads as a moral lesson is a defect and is treated as one in review.

> "I can't recommend how much to stake — that's a decision only you can make. I can show what your
> current position earned over the last 30 days and how the tiers differ."

## Testing

Every rule above maps to cases in the golden sets described in
[04-agents.md#evaluation](04-agents.md#evaluation). The refusal suite runs on every prompt change,
every model change and every schema change. A regression there blocks the release, and there is no
override flag.
