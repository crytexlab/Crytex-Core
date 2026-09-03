---
title: <short, specific title>
state: draft
author: <github handle>
created: <YYYY-MM-DD>
affects: [spec/openapi.yaml]   # files or layers this changes
---

# Summary

Two or three sentences. What changes, for whom.

# Motivation

What is broken or missing today. Concrete, with the evidence — a support pattern, a cost number, an
integration that could not be built. "It would be nice" is not a motivation.

# Design

The actual proposal. Include the schema diff or the endpoint definition inline; a reviewer should
not have to reconstruct it from prose.

```yaml
# example: the shape being added
```

# Guardrail impact

Which rules in `docs/05-guardrails.md` this touches, and how it stays inside them. If it does not
touch any, say so explicitly — that is a claim reviewers will check, not a formality.

# Permission impact

Does this introduce a tool, change a tier, or widen what an agent can do? If yes, describe the blast
radius if the model behaves adversarially.

# Cost and latency

Expected effect per request. A change that adds tokens to every prompt is a cost change and should
be presented as one.

# Alternatives considered

Including doing nothing. Say why each was rejected.

# Migration

How existing integrators move. If anything breaks, this section is the deprecation timeline: at
minimum 12 months of overlap for a `/v1` field.

# Open questions

The parts you have not solved. Leaving this section empty is usually a sign the RFC is not ready.
