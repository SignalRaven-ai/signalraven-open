import * as coda from "@codahq/packs-sdk";

export const pack = coda.newPack();

const BASE = "https://api.signalraven.ai/api/v1";

pack.addNetworkDomain("signalraven.ai");

// SignalRaven API keys are OAuth clients: Coda exchanges the client id and
// secret for a short-lived bearer token and refreshes it on expiry.
pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2ClientCredentials,
  tokenUrl: "https://auth.signalraven.ai/oauth2/token",
  scopes: [
    "read:signals",
    "read:sources",
    "read:watchlist",
    "read:icp",
    "read:intelligence",
    "read:usage",
    "write:intelligence",
  ],
  instructionsUrl: "https://signalraven.ai/developers",
  getConnectionName: async function (context) {
    const res = await context.fetcher.fetch({ method: "GET", url: `${BASE}/_authcheck` });
    const scopes = (res.body?.oauth?.scopes as string[] | undefined) ?? [];
    return scopes.length ? `SignalRaven (${scopes.length} scopes)` : "SignalRaven";
  },
});

// ── Schemas ───────────────────────────────────────────────────────────────

const SignalSchema = coda.makeObjectSchema({
  properties: {
    signalId: { type: coda.ValueType.String, description: "The signal's id." },
    company: { type: coda.ValueType.String, description: "The person's company." },
    linkedinUrl: { type: coda.ValueType.String, codaType: coda.ValueHintType.Url, description: "The person's LinkedIn profile." },
    location: { type: coda.ValueType.String },
    strength: { type: coda.ValueType.Number, description: "Signal strength out of 10." },
    signalType: { type: coda.ValueType.String },
    whyItMatters: { type: coda.ValueType.String },
    suggestedOpener: { type: coda.ValueType.String, description: "A first line to send." },
    talkingPoints: { type: coda.ValueType.Array, items: { type: coda.ValueType.String } },
    postPreview: { type: coda.ValueType.String, description: "The LinkedIn post the person engaged with." },
    icpFit: { type: coda.ValueType.Number, description: "ICP composite score, 0 to 100." },
    detectedAt: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
    link: { type: coda.ValueType.String, codaType: coda.ValueHintType.Url, description: "The signal in SignalRaven." },
  },
  displayProperty: "company",
  idProperty: "signalId",
  featuredProperties: ["strength", "whyItMatters", "suggestedOpener", "linkedinUrl"],
});

const ReportSchema = coda.makeObjectSchema({
  properties: {
    reportId: { type: coda.ValueType.String },
    name: { type: coda.ValueType.String },
    reportType: { type: coda.ValueType.String, description: "account or person." },
    status: { type: coda.ValueType.String },
    createdAt: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
    cached: { type: coda.ValueType.Boolean, description: "True when an existing report was returned without spending credits." },
    link: { type: coda.ValueType.String, codaType: coda.ValueHintType.Url },
  },
  displayProperty: "name",
  idProperty: "reportId",
  featuredProperties: ["reportType", "status", "createdAt"],
});

const SourceSchema = coda.makeObjectSchema({
  properties: {
    sourceId: { type: coda.ValueType.String },
    displayName: { type: coda.ValueType.String },
    sourceType: { type: coda.ValueType.String },
    linkedinUrl: { type: coda.ValueType.String, codaType: coda.ValueHintType.Url },
    isActive: { type: coda.ValueType.Boolean },
    strengthScore: { type: coda.ValueType.Number },
    signalCount: { type: coda.ValueType.Number },
    totalPosts: { type: coda.ValueType.Number },
    qualifiedPosts: { type: coda.ValueType.Number },
  },
  displayProperty: "displayName",
  idProperty: "sourceId",
  featuredProperties: ["sourceType", "strengthScore", "signalCount", "isActive"],
});

const IcpSchema = coda.makeObjectSchema({
  properties: {
    minEmployees: { type: coda.ValueType.Number },
    maxEmployees: { type: coda.ValueType.Number },
    industries: { type: coda.ValueType.Array, items: { type: coda.ValueType.String } },
    titles: { type: coda.ValueType.Array, items: { type: coda.ValueType.String } },
    personas: { type: coda.ValueType.Array, items: { type: coda.ValueType.String } },
    seniority: { type: coda.ValueType.Array, items: { type: coda.ValueType.String } },
    context: { type: coda.ValueType.String },
    summary: { type: coda.ValueType.String },
  },
  displayProperty: "summary",
});

// ── Mappers ───────────────────────────────────────────────────────────────

type RawSignal = {
  id: string; type: string; strength: number; createdAt: string;
  person?: { company?: string | null; linkedinUrl?: string | null; location?: string | null };
  icp?: { compositeScore?: number } | null;
  whyItMatters?: string | null; suggestedOpener?: string | null; talkingPoints?: string[] | null; postPreview?: string | null;
};
type RawReport = { id: string; type: string; name?: string | null; slug?: string | null; status: string; createdAt?: string; cached?: boolean };

function pct(v?: number | null) {
  if (v == null) return undefined;
  return Math.round(v <= 1 ? v * 100 : v);
}

function mapSignal(s: RawSignal) {
  return {
    signalId: s.id,
    company: s.person?.company ?? undefined,
    linkedinUrl: s.person?.linkedinUrl ?? undefined,
    location: s.person?.location ?? undefined,
    strength: s.strength,
    signalType: s.type,
    whyItMatters: s.whyItMatters ?? undefined,
    suggestedOpener: s.suggestedOpener ?? undefined,
    talkingPoints: s.talkingPoints ?? [],
    postPreview: s.postPreview ?? undefined,
    icpFit: pct(s.icp?.compositeScore),
    detectedAt: s.createdAt,
    link: `https://app.signalraven.ai/signals/${s.id}`,
  };
}

function mapReport(r: RawReport) {
  return {
    reportId: r.id,
    name: r.name ?? r.slug ?? r.id,
    reportType: r.type,
    status: r.status,
    createdAt: r.createdAt,
    cached: r.cached ?? false,
    link: `https://app.signalraven.ai/intelligence/${r.type === "account" ? "accounts" : "people"}/${r.id}`,
  };
}

async function get(context: coda.ExecutionContext, path: string, params: Record<string, string | number | undefined> = {}) {
  const url = coda.withQueryParams(`${BASE}${path}`, Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")));
  const res = await context.fetcher.fetch({ method: "GET", url });
  return res.body;
}

// ── Sync tables ───────────────────────────────────────────────────────────

const PAGE = 100;

pack.addSyncTable({
  name: "Signals",
  description: "Qualified buying-intent signals, newest first, with the opener and talking points for each.",
  identityName: "Signal",
  schema: SignalSchema,
  formula: {
    name: "SyncSignals",
    description: "Sync signals from SignalRaven.",
    parameters: [
      coda.makeParameter({ type: coda.ParameterType.Number, name: "minStrength", description: "Only signals at or above this strength, 0 to 10.", optional: true }),
      coda.makeParameter({ type: coda.ParameterType.String, name: "signalType", description: "Filter by signal type, for example KEYWORD_SEARCH_COMMENT.", optional: true }),
    ],
    execute: async function ([minStrength, signalType], context) {
      const offset = (context.sync.continuation?.offset as number | undefined) ?? 0;
      const body = await get(context, "/signals", { limit: PAGE, offset, minStrength, type: signalType });
      const rows = ((body.data as RawSignal[]) ?? []).map(mapSignal);
      const more = rows.length === PAGE && offset + PAGE < (body.total ?? 0);
      return { result: rows, continuation: more ? { offset: offset + PAGE } : undefined };
    },
  },
});

pack.addSyncTable({
  name: "IntelligenceReports",
  description: "Person and account research reports.",
  identityName: "IntelligenceReport",
  schema: ReportSchema,
  formula: {
    name: "SyncIntelligenceReports",
    description: "Sync research reports from SignalRaven.",
    parameters: [
      coda.makeParameter({ type: coda.ParameterType.String, name: "reportType", description: "account, person, or empty for all.", optional: true }),
    ],
    execute: async function ([reportType], context) {
      const offset = (context.sync.continuation?.offset as number | undefined) ?? 0;
      const body = await get(context, "/intelligence", { limit: PAGE, offset, type: reportType });
      const rows = ((body.data as RawReport[]) ?? []).map(mapReport);
      const more = rows.length === PAGE && offset + PAGE < (body.total ?? 0);
      return { result: rows, continuation: more ? { offset: offset + PAGE } : undefined };
    },
  },
});

pack.addSyncTable({
  name: "Sources",
  description: "The LinkedIn sources being monitored, with per-source metrics.",
  identityName: "Source",
  schema: SourceSchema,
  formula: {
    name: "SyncSources",
    description: "Sync monitored sources from SignalRaven.",
    parameters: [
      coda.makeParameter({ type: coda.ParameterType.String, name: "period", description: "Metrics window: 7, 30, or all.", optional: true, suggestedValue: "30" }),
    ],
    execute: async function ([period], context) {
      const body = await get(context, "/sources", { period: period || "30" });
      type RawSource = { id: string; displayName?: string; type?: string; linkedinUrl?: string | null; isActive?: boolean; strengthScore?: number; signalCount?: number; totalPosts?: number; qualifiedPosts?: number };
      const rows = ((body.data as RawSource[]) ?? []).map((s) => ({
        sourceId: s.id, displayName: s.displayName, sourceType: s.type, linkedinUrl: s.linkedinUrl ?? undefined,
        isActive: s.isActive, strengthScore: s.strengthScore, signalCount: s.signalCount, totalPosts: s.totalPosts, qualifiedPosts: s.qualifiedPosts,
      }));
      return { result: rows };
    },
  },
});

// ── Formulas ──────────────────────────────────────────────────────────────

pack.addFormula({
  name: "ICP",
  description: "The ideal customer profile your signals are scored against.",
  parameters: [],
  resultType: coda.ValueType.Object,
  schema: IcpSchema,
  execute: async function (_args, context) {
    const body = await get(context, "/icp");
    const d = (body.data ?? {}) as Record<string, unknown>;
    const titles = (d.targetTitles as string[]) ?? [];
    return {
      minEmployees: d.minEmployees, maxEmployees: d.maxEmployees,
      industries: d.targetIndustries ?? [], titles, personas: d.targetPersonas ?? [], seniority: d.targetSeniority ?? [],
      context: d.additionalContext ?? undefined,
      summary: `${d.minEmployees ?? "?"} to ${d.maxEmployees ?? "?"} employees; ${titles.slice(0, 3).join(", ")}`,
    };
  },
});

pack.addFormula({
  name: "Signal",
  description: "One signal by id, with the full write-up.",
  parameters: [coda.makeParameter({ type: coda.ParameterType.String, name: "signalId", description: "The signal's id." })],
  resultType: coda.ValueType.Object,
  schema: SignalSchema,
  execute: async function ([signalId], context) {
    const body = await get(context, `/signals/${encodeURIComponent(signalId)}`);
    return mapSignal(body.data as RawSignal);
  },
});

pack.addFormula({
  name: "RunAccountIntelligence",
  description: "Start an account research report for a company LinkedIn URL. Spends credits unless a recent report exists.",
  isAction: true,
  parameters: [coda.makeParameter({ type: coda.ParameterType.String, name: "companyUrl", description: "For example https://www.linkedin.com/company/example" })],
  resultType: coda.ValueType.Object,
  schema: ReportSchema,
  execute: async function ([companyUrl], context) {
    const res = await context.fetcher.fetch({
      method: "POST", url: `${BASE}/intelligence/accounts`,
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyUrl }),
    });
    return mapReport(res.body.data as RawReport);
  },
});

pack.addFormula({
  name: "RunPersonIntelligence",
  description: "Start a person research report for a LinkedIn profile URL. Spends credits unless a recent report exists.",
  isAction: true,
  parameters: [
    coda.makeParameter({ type: coda.ParameterType.String, name: "personUrl", description: "For example https://www.linkedin.com/in/example" }),
    coda.makeParameter({ type: coda.ParameterType.String, name: "sourceCompanyReportId", description: "Optional account report to attach this person to.", optional: true }),
  ],
  resultType: coda.ValueType.Object,
  schema: ReportSchema,
  execute: async function ([personUrl, sourceCompanyReportId], context) {
    const res = await context.fetcher.fetch({
      method: "POST", url: `${BASE}/intelligence/people`,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personUrl, sourceCompanyReportId: sourceCompanyReportId || undefined }),
    });
    return mapReport(res.body.data as RawReport);
  },
});
