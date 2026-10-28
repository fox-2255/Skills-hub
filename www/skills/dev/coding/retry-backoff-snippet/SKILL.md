---
id: retry-backoff-snippet
name: Retry with backoff
category: coding
pack: dev
type: snippet
description: Node function na nag-re-retry na may exponential backoff, jitter, at timeout.
tags: [node, retry, backoff, async]
version: 1.0.0
updated: 2026-10-28
related: [prompt-template-bug-fix]
---

# Code
```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, { retries = 4, baseMs = 500, maxMs = 8000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries || err.retryable === false) throw err;
      const delay = Math.min(maxMs, baseMs * 2 ** attempt);
      await sleep(delay / 2 + Math.random() * (delay / 2));
    }
  }
}
```

# Gamit
```js
// ilagay sa loob ng async function o .mjs file
const data = await withRetry(async () => {
  const res = await fetch(process.env.API_URL, { signal: AbortSignal.timeout(10000) });
  if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status}`);
  if (!res.ok) {
    const e = new Error(`HTTP ${res.status}`);
    e.retryable = false;
    throw e;
  }
  return res.json();
});
```

# Notes
- Nire-retry lang ang 429 at 5xx. Ang 4xx ay hindi, dahil mali ang request.
- `AbortSignal.timeout` ay kailangan ng Node 18 pataas.
- Ang jitter ay para hindi sabay-sabay ang retry ng maraming request.
