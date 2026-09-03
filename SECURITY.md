# Security policy

## Reporting a vulnerability

**Do not open a public issue.**

Use GitHub's private reporting — *Security → Report a vulnerability* on this repository — or email
**security@crytex.io**. If you want to encrypt, the PGP key is published at
`https://crytex.io/.well-known/pgp-key.txt`.

Include: what you found, how to reproduce it, and what an attacker gets. A working proof of concept
moves things faster than a description.

## What to expect

| | Target |
| --- | --- |
| Acknowledgement | 48 hours |
| Initial assessment | 5 business days |
| Fix or mitigation for critical issues | 14 days |
| Public disclosure | Coordinated, after a fix ships |

We will credit you unless you ask us not to.

## In scope

- This repository: schemas, specifications, SDK code.
- The public API described in [`spec/openapi.yaml`](spec/openapi.yaml).
- Anything that would let an agent exceed its declared permission tier, or a prepared action to be
  submitted without a valid, bound, unexpired confirmation. **This is the class we care about most.**
- Prompt injection that reaches a tool call, changes an agent's permissions, or extracts another
  user's data. Injection that merely makes a model say something silly is interesting but lower
  severity.
- Anything that turns a model endpoint into an open proxy usable by a third party at our cost.

## Out of scope

- Findings from automated scanners with no demonstrated impact.
- Missing security headers on documentation pages.
- Social engineering, physical access, or attacks on third-party providers.
- Model outputs you disagree with. Report those as issues; they are quality bugs, not
  vulnerabilities — unless the output crosses a rule in [`docs/05-guardrails.md`](docs/05-guardrails.md),
  in which case it is a guardrail failure and we want it here.

## Safe harbour

Research conducted in good faith under this policy will not be pursued legally. Stay within these
lines: use only your own accounts, do not access or modify other users' data, do not degrade the
service, do not run automated load against production, and give us a reasonable window before
disclosing.

## For integrators

- API keys are server-side secrets. A key in browser code is a compromised key.
- Rotate keys from the account area; revocation is immediate.
- Verify webhook signatures before trusting a payload.
- Treat any model output as untrusted content. Render it as text — never as HTML, never into an
  `eval`, never as a query.
