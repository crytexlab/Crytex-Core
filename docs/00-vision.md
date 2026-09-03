# Vision

## The short version

Crytex today is a platform that has an AI feature bolted to the side of it: a chat widget that
answers questions from a folder of text files. That is a support tool, not an intelligence layer.

What we are building instead: **every product surface on Crytex gets its context, its numbers and
its explanations from one shared intelligence layer**, and users interact with that layer through
agents that can read everything and act on almost nothing without an explicit human confirmation.

## Three shifts

**1. From one chatbot to many narrow agents.**
A single prompt that knows about staking, withdrawals, launchpad rules and market structure is a
prompt that is mediocre at all four. The agent layer replaces it with small, declared agents — each
with a manifest, a tool list, a permission tier and its own evaluation set. See
[04-agents.md](04-agents.md).

**2. From static text to live context.**
The knowledge that feeds a model should not be a folder someone remembers to update. It should be
the same event stream the platform already emits: deposits, stakes, predictions, launchpad rounds,
market ticks. The data layer is the product's own state, not a copy of it.

**3. From answers to instrumented answers.**
Every model output that touches money must be traceable: which model, which prompt version, which
inputs, which retrieved documents, what it cost, and whether a human confirmed the action. Without
that, an AI feature on a financial platform is a liability rather than an asset.

## What we are explicitly not building

- **Not an oracle.** No system described in this repository will predict a price, promise a return,
  or tell a specific person what to buy. The line is drawn in [05-guardrails.md](05-guardrails.md)
  and it is a hard product constraint, not a disclaimer.
- **Not an autonomous fund mover.** Agents may prepare a transaction. A human confirms it. There is
  no permission tier that skips this, and adding one would require an RFC that we would reject.
- **Not a foundation-model project.** We do not train base models. We build the retrieval, the
  routing, the evaluation and the guardrails around models we rent.
- **Not a closed box.** The interface — schemas, endpoints, agent manifests, permission semantics —
  is public in this repository so that it can be reviewed by people who do not work here.

## Why publish any of it

Three reasons, in order of how much they matter to us:

1. **Auditability.** A crypto platform asking for trust should be checkable. Publishing the agent
   permission model means anyone can verify that "the AI cannot withdraw your funds" is a structural
   property, not a promise.
2. **Integration.** Partners, launchpad projects and third-party tools need a stable surface to
   build on. A versioned OpenAPI document is that surface.
3. **Recruiting and review.** Good engineers read repositories before they read job descriptions.

## Success criteria

The first phase is done when all four are true:

- A product surface (AI Terminal) is served entirely through the agent layer, with no direct model
  calls left in the PHP application.
- Every agent response carries a trace id that resolves to its inputs, retrieved context and cost.
- The support knowledge base is generated from platform state, not hand-edited.
- An external developer can build a working integration from `spec/` alone, without asking us
  anything.
