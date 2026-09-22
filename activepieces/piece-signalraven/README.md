# SignalRaven for Activepieces

LinkedIn buying-intent signals, prospect and account research, and openers from your SignalRaven workspace, inside Activepieces flows.

## Install

Activepieces → Settings → My Pieces → Install Piece → `@signalraven/piece-signalraven`.

## Connect

Create an API key in SignalRaven (Settings → API keys at https://app.signalraven.ai). Paste the client id and client secret into the piece's connection. Keys created with all read scopes plus `write:intelligence` and `write:destinations` unlock every action and both triggers.

## Triggers

- **New Signal (Webhook)**: instant. Registers a webhook destination in your workspace and verifies each delivery's signature.
- **New Signal**: polling, with minimum strength and type filters. Use it when the key has no `write:destinations` scope. Read-path signals carry the person's company, LinkedIn profile and location; the webhook delivery also carries the person's name and title.

## Actions

List Signals, Get Signal, List Sources, Get ICP, List Watchlist Posts, List Intelligence Reports, Get Account Intelligence, Get Person Intelligence, Run Account Intelligence, Run Person Intelligence, Get Usage, and a Custom API Call.

Docs: https://signalraven.ai/developers · Support: support@signalraven.ai
