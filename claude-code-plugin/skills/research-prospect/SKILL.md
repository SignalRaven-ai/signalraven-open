---
name: research-prospect
description: Research a person or company before outreach using the SignalRaven MCP server. Use when the user names a prospect, pastes a LinkedIn URL, or asks who is showing intent this week.
---

# Research a prospect

Use the `signalraven` MCP server. Every tool reads the user's own workspace over OAuth; the first call opens the sign-in.

1. **Find what SignalRaven already knows.** Call `list_signals` with `minStrength: 6` and, if the user named a person or company, scan the results for them. Call `get_signal` on any match for the full detail: person, ICP analysis, why it matters, suggested opener, talking points.
2. **Check existing reports.** Call `list_intelligence` with `q` set to the person or company name. Open a match with `get_person_intelligence` or `get_account_intelligence`.
3. **Run a report only when asked.** `run_person_intelligence` and `run_account_intelligence` spend credits and take time. Ask before calling them, and say that they spend credits.
4. **Answer in this shape:** who they are, what they engaged with and when, the ICP read, why now, and three talking points. Quote the post they engaged with when the signal carries it.

Keep it short. Facts from the tools, no invention. If nothing comes back, say SignalRaven has no signal on them yet and offer to run a report.
