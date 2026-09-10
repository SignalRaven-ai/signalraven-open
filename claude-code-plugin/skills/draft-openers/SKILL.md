---
name: draft-openers
description: Draft three LinkedIn openers from a SignalRaven signal. Use when the user asks what to say to a prospect, wants a connection note, or asks for an opener from a signal.
---

# Draft openers from a signal

1. Get the signal. If the user gave an id, call `get_signal`. Otherwise call `list_signals` with `minStrength: 6` and pick the one the user means, or show the top five and ask.
2. Read the post excerpt, the summary, `whyItMatters`, `suggestedOpener`, and the talking points.
3. Write three openers, each under 300 characters, each citing the specific thing the person posted or engaged with. Vary the angle: one about their point, one about a consequence for their team, one that asks a question. No greeting, no pitch, no compliments about their profile.
4. Show the three openers and the signal's portal link (`signalDetailUrl`).

Never invent an engagement. If the signal has no post text, write from `whyItMatters` and say so.
