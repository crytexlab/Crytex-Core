# Examples

Everything here runs against the sandbox, which serves deterministic fixtures. Swap the host for
production once you have a live key.

```bash
export CRYTEX_TOKEN="ctx_test_..."
export CRYTEX_API="https://sandbox.api.crytex.io/v1"
```

## Signals

```bash
curl -s "$CRYTEX_API/signals" \
  -H "Authorization: Bearer $CRYTEX_TOKEN" \
  -G --data-urlencode "symbols=BTC,ETH,SOL" \
     --data-urlencode "min_score=0.6" | jq
```

Every signal carries `inputs` — feature ids you can quote back when you want to know where a number
came from.

## A forecast, with its interval

```bash
curl -s "$CRYTEX_API/forecasts/ETH?horizon=7d&threshold_pct=-10" \
  -H "Authorization: Bearer $CRYTEX_TOKEN" | jq
```

```json
{
  "symbol": "ETH",
  "horizon": "7d",
  "threshold_pct": -10,
  "probability": 0.18,
  "interval": { "low": 0.11, "high": 0.27, "confidence": 0.9 },
  "model_version": "fc-2026.08-b",
  "limitations": "Does not model scheduled protocol events or exchange outages.",
  "generated_at": "2026-09-03T11:02:00Z"
}
```

There is no endpoint that returns a predicted price. If you need one, this is not the API for it.

## Talking to an agent

```bash
curl -s "$CRYTEX_API/agents/terminal.markets/messages" \
  -H "Authorization: Bearer $CRYTEX_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "message": "Compare ETH and SOL funding over the last week",
        "surface": { "page": "/terminal", "open_panels": ["pnl_1"] }
      }' | jq
```

The response contains `panels` (rendering instructions, never HTML) and a `trace_id`. Keep the trace
id: it resolves to the audit record for that run, and it is the first thing support will ask for.

## Streaming

```js
import { Crytex } from '@crytexlab/sdk';

const ctx = new Crytex({ token: process.env.CRYTEX_TOKEN, baseUrl: process.env.CRYTEX_API });

for await (const frame of ctx.agents.stream('terminal.markets', { message: 'Why is SOL funding negative?' })) {
  if (frame.type === 'token') process.stdout.write(frame.text);
  if (frame.type === 'panel') console.log('\n[panel]', frame.panel.type);
}
```

## Validating an agent manifest

`agent.manifest.json` in this folder is a valid manifest. Break something in it and watch CI reject
it the same way the runtime would:

```bash
npx ajv-cli validate -s ../spec/agent-manifest.schema.json -d agent.manifest.json --spec=draft2020
```

## Handling errors

Match on `error.code`, never on the message — messages are translated and get reworded.

| Code | Meaning | What to do |
| --- | --- | --- |
| `unauthorized` | Bad or revoked key | Reissue in Account → API keys |
| `rate_limited` | Too many requests | Honour `Retry-After`; both SDKs already do |
| `budget_exhausted` | Credit ceiling for the period | Show the user their usage; do not retry |
| `agent_unavailable` | Agent not enabled at the caller's tier | Fall back to a non-AI view |
