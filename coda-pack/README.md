# SignalRaven Pack for Coda

Sync LinkedIn buying-intent signals, research reports and monitored sources from your SignalRaven workspace into Coda tables, and start research reports from a button.

## Connect

Create an API key in SignalRaven (Settings, then API keys, at https://app.signalraven.ai) with the read scopes plus `write:intelligence`. Paste the client id and client secret when Coda asks; the Pack exchanges them for a token itself.

## What's inside

- Sync tables: Signals (with minimum strength and type filters), IntelligenceReports, Sources.
- Formulas: ICP(), Signal(signalId).
- Actions: RunAccountIntelligence(companyUrl), RunPersonIntelligence(personUrl, sourceCompanyReportId).

## Develop

```
npm install
npx coda validate pack.ts
npx coda auth pack.ts                 # paste the client id and secret
npx coda execute pack.ts Signals --maxRows 5
npx coda execute pack.ts ICP
```

## Publish (Coda account required)

```
npx coda register <api token>         # from Coda account settings
npx coda create pack.ts               # once; writes .coda-pack.json
npx coda upload pack.ts
npx coda release pack.ts
```

Then in Pack Studio: listing details, icon, and Publish to the gallery.

Docs: https://signalraven.ai/developers · Support: support@signalraven.ai
