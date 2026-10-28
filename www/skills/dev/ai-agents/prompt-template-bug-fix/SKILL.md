---
id: prompt-template-bug-fix
name: Bug fix prompt
category: ai-agents
pack: dev
type: prompt
description: Template na prompt para ipaayos sa AI ang bug na may kumpletong detalye.
tags: [prompt, debugging, ai]
version: 1.0.0
updated: 2026-10-28
related: [retry-backoff-snippet]
---

# Kailan gagamitin
Kapag may error o maling behavior. Punan ang mga field sa taas, tapos i-copy ang prompt.

# Prompt
```
Fix this bug. Give the root cause first, then a minimal patch.

Environment: {{environment}}

Error or symptom:
{{error}}

Expected behavior:
{{expected}}

Code:
{{code}}

Rules: do not rewrite unrelated code. If unsure, say so and list your assumptions.
```

# Tips
- Isama ang eksaktong error message at ang version ng runtime.
- Kung maraming file, ibigay lang ang may kinalaman.
- Hingin ang command na magpapatunay na gumana ang fix.
