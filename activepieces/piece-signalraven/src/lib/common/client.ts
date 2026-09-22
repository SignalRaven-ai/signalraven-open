import { httpClient, HttpMethod, HttpRequest, QueryParams } from '@activepieces/pieces-common';

export const BASE_URL = 'https://api.signalraven.ai/api/v1';
export const TOKEN_URL = 'https://auth.signalraven.ai/oauth2/token';

export const READ_SCOPES = [
  'read:signals',
  'read:sources',
  'read:watchlist',
  'read:icp',
  'read:intelligence',
  'read:usage',
  'read:destinations',
];

export type Creds = { clientId: string; clientSecret: string };
/**
 * The framework hands CustomAuth values as `{ type, props: {...} }` to
 * actions and triggers, and as the bare props to `validate`. Accept both.
 */
export type SignalRavenAuth = unknown;
function creds(auth: SignalRavenAuth): Creds {
  const a = auth as { props?: Partial<Creds> } & Partial<Creds>;
  const p = a?.props ?? a;
  if (!p?.clientId || !p?.clientSecret) throw new Error('SignalRaven connection is missing the client id or secret.');
  return { clientId: String(p.clientId), clientSecret: String(p.clientSecret) };
}

type TokenResponse = { access_token?: string; error?: string; error_description?: string };

function isInvalidScope(err: unknown): boolean {
  const text = `${(err as Error)?.message ?? ''} ${JSON.stringify((err as { response?: { body?: unknown } })?.response?.body ?? '')}`;
  return /invalid_scope/i.test(text);
}

/**
 * SignalRaven API keys are OAuth clients. Exchange the client id and secret
 * for a short-lived bearer token with the client_credentials grant.
 */
export async function getToken(auth: SignalRavenAuth, scopes: string[]): Promise<string> {
  const { clientId, clientSecret } = creds(auth);
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: scopes.join(' '),
  }).toString();
  const res = await httpClient.sendRequest<TokenResponse>({
    method: HttpMethod.POST,
    url: TOKEN_URL,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.body?.access_token) {
    throw new Error(`Token exchange failed: ${res.body?.error ?? res.status}`);
  }
  return res.body.access_token;
}

/**
 * A key may have been created with a subset of scopes. Ask for the full
 * read set (plus any write scope the call needs); on invalid_scope, retry
 * with only the scope this call requires.
 */
async function tokenForScope(auth: SignalRavenAuth, scope: string): Promise<string> {
  const wanted = Array.from(new Set([...READ_SCOPES, scope]));
  try {
    return await getToken(auth, wanted);
  } catch (err) {
    if (!isInvalidScope(err)) throw err;
    return getToken(auth, [scope]);
  }
}

export async function apiCall<T = unknown>(opts: {
  auth: SignalRavenAuth;
  method?: HttpMethod;
  path: string;
  scope: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}): Promise<T> {
  const token = await tokenForScope(opts.auth, opts.scope);
  const queryParams: QueryParams = {};
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== null && v !== '') queryParams[k] = String(v);
  }
  const request: HttpRequest = {
    method: opts.method ?? HttpMethod.GET,
    url: `${BASE_URL}${opts.path}`,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    queryParams,
    body: opts.body,
  };
  const res = await httpClient.sendRequest<T>(request);
  return res.body;
}

export type ListResponse<T> = { data: T[]; total?: number; limit?: number; offset?: number; _meta?: { mode?: string } };

export type Signal = {
  id: string;
  type: string;
  strength: number;
  person?: { company?: string | null; linkedinUrl?: string | null; location?: string | null };
  whyItMatters?: string | null;
  suggestedOpener?: string | null;
  talkingPoints?: string[] | null;
  postPreview?: string | null;
  createdAt: string;
};
