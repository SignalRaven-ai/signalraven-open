---
name: research-prospect
description: Research a person or company before outreach using the SignalRaven tools. Use when the user names a prospect, pastes a LinkedIn URL, or asks who is showing buying intent this week.
---

# Research a prospect

Use the SignalRaven tools. Every tool reads the user's own workspace over OAuth; the first call opens sign-in. If results say sample data, the workspace is not active yet; say so once and continue.

1. **Find what SignalRaven already knows.** Call `list_signals` with `minStrength: 6`. If the user named a person or company, look for them in the results. Call `get_signal` on any match for the full detail: the person, the ICP analysis, why it matters, the suggested opener, the talking points.
2. **Check existing reports.** Call `list_intelligence` with `q` set to the name. Open a match with `get_person_intelligence` or `get_account_intelligence`.
3. **Run a report only when asked.** `run_person_intelligence` and `run_account_intelligence` spend credits and take time. Ask before calling them and say they spend credits.
4. **Answer in this shape:** who they are, what they engaged with and when, the ICP read, why now, three talking points. Quote the post they engaged with when the signal carries it.

Facts come from the tools. Never invent an engagement. If nothing comes back, say SignalRaven has no signal on them yet and offer to run a report.
