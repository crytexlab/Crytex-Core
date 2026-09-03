/**
 * @crytexlab/sdk — zero-dependency client for the Crytex API.
 *
 * Works in Node 18+ and modern browsers. In a browser, never ship a live API key:
 * proxy through your own backend and pass a short-lived session token instead.
 */

const DEFAULT_BASE_URL = 'https://api.crytex.io/v1';

export class CrytexError extends Error {
  constructor(message, { status, code, traceId } = {}) {
    super(message);
    this.name = 'CrytexError';
    this.status = status;
    this.code = code;
    this.traceId = traceId;
  }
}

export class Crytex {
  /**
   * @param {object} options
   * @param {string} options.token      API key or session token.
   * @param {string} [options.baseUrl]  Override for sandbox or self-hosted.
   * @param {number} [options.timeout]  Milliseconds, default 30000.
   * @param {number} [options.retries]  Retries for 429 and 5xx, default 2.
   */
  constructor({ token, baseUrl = DEFAULT_BASE_URL, timeout = 30000, retries = 2 } = {}) {
    if (!token) throw new CrytexError('A token is required');
    this.token = token;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeout = timeout;
    this.retries = retries;

    this.signals = {
      list: (params = {}) => this.#get('/signals', normaliseListParams(params)),
    };

    this.forecasts = {
      get: (symbol, { horizon, thresholdPct }) =>
        this.#get(`/forecasts/${encodeURIComponent(symbol)}`, {
          horizon,
          threshold_pct: thresholdPct,
        }),
    };

    this.portfolio = {
      risk: () => this.#get('/portfolio/risk'),
    };

    this.agents = {
      list: () => this.#get('/agents'),
      message: (agent, body) => this.#post(`/agents/${encodeURIComponent(agent)}/messages`, body),
      stream: (agent, body) => this.#stream(`/agents/${encodeURIComponent(agent)}/messages`, body),
    };
  }

  async #request(path, { method = 'GET', query, body, stream = false } = {}) {
    const url = new URL(this.baseUrl + path);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }

    let lastError;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          method,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: stream ? 'text/event-stream' : 'application/json',
            ...(body ? { 'Content-Type': 'application/json' } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (response.status === 429 || response.status >= 500) {
          if (attempt < this.retries) {
            await sleep(backoffMs(attempt, response.headers.get('Retry-After')));
            continue;
          }
        }

        if (!response.ok) throw await toError(response);
        return stream ? response : await response.json();
      } catch (error) {
        lastError = error instanceof CrytexError ? error : new CrytexError(error.message);
        if (error instanceof CrytexError || attempt === this.retries) throw lastError;
        await sleep(backoffMs(attempt));
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError;
  }

  #get(path, query) {
    return this.#request(path, { query });
  }

  #post(path, body) {
    return this.#request(path, { method: 'POST', body });
  }

  /** Async iterator over server-sent events from an agent run. */
  async *#stream(path, body) {
    const response = await this.#request(path, {
      method: 'POST',
      body: { ...body, stream: true },
      stream: true,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        const line = frame.split('\n').find((l) => l.startsWith('data:'));
        if (!line) continue;

        const payload = line.slice(5).trim();
        if (payload === '[DONE]') return;

        try {
          yield JSON.parse(payload);
        } catch {
          // A malformed frame is skipped rather than killing the stream.
        }
      }
    }
  }
}

function normaliseListParams({ symbols, minScore, limit }) {
  return {
    symbols: Array.isArray(symbols) ? symbols.join(',') : symbols,
    min_score: minScore,
    limit,
  };
}

async function toError(response) {
  let code;
  let message = `HTTP ${response.status}`;
  let traceId;

  try {
    const payload = await response.json();
    code = payload?.error?.code;
    message = payload?.error?.message ?? message;
    traceId = payload?.error?.trace_id;
  } catch {
    // Non-JSON error body; the status line is all we have.
  }

  return new CrytexError(message, { status: response.status, code, traceId });
}

function backoffMs(attempt, retryAfterHeader) {
  const retryAfter = Number(retryAfterHeader);
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
  return Math.min(2 ** attempt * 500, 8000) + Math.random() * 250;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default Crytex;
