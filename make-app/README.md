# SignalRaven for Make

LinkedIn buying-intent signals, prospect and account research, and openers from your SignalRaven workspace, in Make scenarios.

## Connection

Create an API key in SignalRaven (Settings, then API keys, at https://app.signalraven.ai) and paste the client id and client secret. Make exchanges them for a short-lived token and refreshes it itself. Keys created with fewer scopes work: edit the Scopes field under advanced settings.

## Modules

**Signals**
- Watch Signals (instant): registers a webhook destination in your workspace and fires on every qualified signal. Needs the `write:destinations` scope.
- Watch Signals (Polling): the same signals on a schedule, with minimum strength and type filters.
- List Signals, Get a Signal

**Research**
- List Intelligence Reports, Get an Account Report, Get a Person Report
- Run Account Intelligence, Run Person Intelligence (spend credits unless a recent report exists)

**Workspace**
- List Sources, List Watchlist Posts, Get the ICP, Get Usage

**Other**
- Make an API Call

## Data

Read-path signals carry the person's company, LinkedIn profile and location, a strength score out of 10, why it matters, a suggested opener and talking points. Webhook deliveries also carry the person's name and title. An account without an active workspace returns a labeled sample dataset.

## Deploy (Make account required)

Every file here is one section of the app as Make's SDK Apps API expects it, validated against Make's published JSON schemas. To deploy:

```
MAKE_API_TOKEN=<token with sdk-apps:read and sdk-apps:write> MAKE_ZONE=us1.make.com node deploy.mjs
```

Then in Make: open the app, create a connection with a SignalRaven API key, run a scenario against each module, and request the public review from the app's settings (or `POST /sdk/apps/signalraven/1/review`).

Docs: https://signalraven.ai/developers · Support: support@signalraven.ai
