# Contributing

## Before you start

- Fixing a typo, an example or a broken link → open a pull request.
- Changing a schema, an endpoint, a permission tier or a layer boundary → open an
  [RFC](rfcs/README.md) first.
- Found a vulnerability → do **not** open an issue. See [SECURITY.md](SECURITY.md).

## Local setup

```bash
git clone https://github.com/crytexlab/crytex-core.git
cd crytex-core
npm install --prefix sdk/js
```

## Checks that run in CI

Run them before pushing; they are the same commands the workflow runs.

```bash
# OpenAPI
npx @redocly/cli lint spec/openapi.yaml

# JSON Schemas are themselves valid, and the example manifest validates
npx ajv-cli compile -s spec/agent-manifest.schema.json --spec=draft2020
npx ajv-cli compile -s spec/events.schema.json --spec=draft2020
npx ajv-cli validate -s spec/agent-manifest.schema.json -d examples/agent.manifest.json --spec=draft2020

# Links in docs resolve
npx markdown-link-check -q docs/*.md README.md
```

## Style

**Documents.** Write what the system does, not what it aspires to. If something is not built, mark
it `spec` or `research` in the status table rather than describing it in the present tense. A
roadmap that reads like a product page is worse than no roadmap.

**Schemas.** Every field gets a `description`. Every enum is closed unless there is a stated reason
it cannot be. Money is a decimal string, never a number — binary rounding on money is not
recoverable downstream.

**Code.** Match the file you are editing. The SDKs are dependency-free on purpose; a PR that adds a
runtime dependency needs to justify it in the description.

**Commits.** Imperative mood, scoped: `spec: add limitations field to Forecast`.

## Pull request checklist

- [ ] CI checks pass locally
- [ ] New or changed fields have descriptions
- [ ] Docs updated if behaviour changed
- [ ] Status tables still honest (`live` / `building` / `spec` / `research`)
- [ ] Breaking change? Linked RFC and a migration note

## Review

One maintainer approval for docs and examples. Two for anything under `spec/`. Changes touching
permission tiers or the confirmation path additionally need a review from someone who did not write
the code — that rule exists because it is the one place where a subtle mistake moves other people's
money.
