# SignalRaven for Claude Code

Research a prospect and draft openers from your workspace's live LinkedIn buying-intent signals, inside Claude Code.

## Install

```
/plugin marketplace add SignalRaven-ai/signalraven-open
/plugin install signalraven@signalraven-open
```

The first tool call opens SignalRaven sign-in (OAuth). Trial and paid workspaces get live data; other workspaces get labeled sample data.

## What it adds

- The `signalraven` MCP server (https://api.signalraven.ai/mcp): signals, sources, watchlist, ICP, intelligence reports, destinations.
- `/research-prospect`: who someone is, what they engaged with, the ICP read, why now, three talking points.
- `/draft-openers`: three openers under 300 characters, each citing what the person actually posted.

Docs: https://signalraven.ai/mcp and https://signalraven.ai/developers.
