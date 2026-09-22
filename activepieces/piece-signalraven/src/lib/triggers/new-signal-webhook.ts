import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { createHmac, timingSafeEqual } from 'crypto';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';

const STORE_KEY = 'signalraven_webhook_destination';

type Created = { data?: { id?: string; signatureSecret?: string } };

/**
 * Registers an Activepieces webhook URL as a SignalRaven webhook destination,
 * so every qualified signal is delivered the moment it lands. Needs a key
 * with the write:destinations scope; use New Signal (polling) otherwise.
 */
export const newSignalWebhook = createTrigger({
  auth: signalravenAuth,
  name: 'new_signal_webhook',
  displayName: 'New Signal (Webhook)',
  description: 'Triggers instantly when SignalRaven delivers a qualified signal. Creates a webhook destination in your workspace (needs the write:destinations scope).',
  aiMetadata: {
    description: 'Instant trigger: SignalRaven pushes each qualified buying-intent signal to this flow through a webhook destination it registers in the workspace. Payload is the flat delivery shape: signalId, strength, personName, personTitle, personCompany, personLinkedinUrl, whyItMatters, suggestedOpener, talkingPoints.',
  },
  props: {},
  sampleData: {
    signalId: '3f9c2a1e-0000-4000-8000-000000000001',
    signalType: 'KEYWORD_SEARCH_COMMENT',
    strength: 9,
    personName: 'Marcus Feld',
    personTitle: 'Director of Corporate Events',
    personCompany: 'Halvorsen Consulting',
    personLinkedinUrl: 'https://www.linkedin.com/in/example',
    whyItMatters: 'Director of Corporate Events is actively talking about venue holds disappearing for next year\'s leadership summit.',
    suggestedOpener: 'Saw your note on venue holds disappearing for next year\'s summit. How far out are you sourcing now?',
  },
  type: TriggerStrategy.WEBHOOK,
  async onEnable(context) {
    const res = await apiCall<Created>({
      auth: context.auth,
      method: HttpMethod.POST,
      path: '/destinations',
      scope: 'write:destinations',
      body: {
        destinationType: 'webhook',
        name: 'Activepieces',
        config: { url: context.webhookUrl, method: 'POST' },
      },
    });
    await context.store.put(STORE_KEY, { id: res.data?.id, secret: res.data?.signatureSecret });
  },
  async onDisable(context) {
    const saved = await context.store.get<{ id?: string }>(STORE_KEY);
    if (saved?.id) {
      await apiCall({
        auth: context.auth,
        method: HttpMethod.DELETE,
        path: `/destinations/${encodeURIComponent(saved.id)}`,
        scope: 'write:destinations',
      }).catch(() => undefined);
    }
    await context.store.delete(STORE_KEY);
  },
  async run(context) {
    const saved = await context.store.get<{ secret?: string }>(STORE_KEY);
    const header = String(context.payload.headers['x-signalraven-signature'] ?? '');
    if (saved?.secret && context.payload.rawBody) {
      const expected = `sha256=${createHmac('sha256', saved.secret).update(String(context.payload.rawBody)).digest('hex')}`;
      const a = new Uint8Array(Buffer.from(expected));
      const b = new Uint8Array(Buffer.from(header));
      if (a.length !== b.length || !timingSafeEqual(a, b)) return [];
    }
    return [context.payload.body];
  },
});
