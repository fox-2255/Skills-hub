---
id: termux-pkg-cheatsheet
name: Termux pkg cheatsheet
category: android-termux
pack: dev
type: reference
description: Mabilis na listahan ng pinakamadalas na Termux commands.
tags: [termux, pkg, android]
version: 1.0.0
updated: 2026-10-28
related: [github-actions-build-apk]
---

# Packages
| Command | Gamit |
|---|---|
| `pkg update && pkg upgrade` | i-update ang lahat ng packages |
| `pkg install <name>` | mag-install ng package |
| `pkg uninstall <name>` | mag-alis ng package |
| `pkg search <keyword>` | maghanap ng package |
| `pkg list-installed` | ilista ang naka-install |
| `pkg show <name>` | detalye ng package |

# Madalas na packages
| Package | Para sa |
|---|---|
| `git` | version control |
| `nodejs` | Node.js |
| `python` | Python |
| `openssh` | SSH |
| `termux-api` | access sa phone features (kailangan din ang Termux:API app) |

# Iba pa
| Command | Gamit |
|---|---|
| `termux-setup-storage` | bigyan ng access sa shared storage |
| `termux-wake-lock` | pigilan ang pag-sleep ng CPU habang tumatakbo ang process |
| `termux-wake-unlock` | alisin ang wake lock |

# Tip
Patayin ang battery optimization para sa Termux sa Android settings para hindi ito pinapatay ng system.
