# RFC process

Small fixes go straight to a pull request. Anything that changes a **schema, an endpoint, a
permission tier, or a layer boundary** needs an RFC first, because those are things other people
build against and we do not get to quietly change them.

## When an RFC is required

| Change | RFC? |
| --- | --- |
| Typo, clarification, example | no |
| New optional field on an existing response | no |
| New endpoint | yes |
| Removing or renaming a field | yes |
| New tool, or changing a tool's tier | yes |
| Anything touching permission tiers or confirmation binding | yes, and expect a long review |
| New guardrail, or relaxing one | yes |
| New agent at `read` tier | no — manifest PR is enough |
| New agent at `suggest` or above | yes |

## Steps

1. Copy [`0000-template.md`](0000-template.md) to `rfcs/0000-my-idea.md`.
2. Open a pull request. The number stays `0000` until it is accepted, then it becomes the PR number.
3. Discussion happens in the PR. Ten days minimum for anything touching money or permissions.
4. A maintainer merges (accepted) or closes with a reason (declined). Declined RFCs stay in the
   repository under `rfcs/declined/` — the reasoning is usually worth more than the proposal.

## States

`draft` → `review` → `accepted` → `implemented`, or → `declined` at any point. An accepted RFC that
has not been implemented within two phases is revisited rather than left to rot.

## Things that will be declined

State them up front so nobody wastes a week writing them up:

- A permission tier that lets an agent move funds without a per-action human confirmation.
- Any endpoint returning a point price prediction.
- Anything that returns another user's data, however aggregated it looks.
- Removing the interval from a forecast to "make the UI cleaner".
- Caching user context across users.

These are not open questions. They are the constraints the architecture exists to enforce; see
[`../docs/05-guardrails.md`](../docs/05-guardrails.md).
