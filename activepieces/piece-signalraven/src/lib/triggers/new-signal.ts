import { createTrigger, PiecePropValueSchema, TriggerStrategy } from '@activepieces/pieces-framework';
import { DedupeStrategy, Polling, pollingHelper } from '@activepieces/pieces-common';
import { CustomAuthConnectionValue } from '@activepieces/shared';
import { signalravenAuth } from '../auth';
import { apiCall, ListResponse, Signal } from '../common/client';
import * as shared from '../common/props';

type Props = { minStrength?: number; signalType?: string };
const PAGE = 100;
const MAX_PAGES = 10;

const polling: Polling<CustomAuthConnectionValue<PiecePropValueSchema<typeof signalravenAuth>>, Props> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth, propsValue, lastFetchEpochMS }) => {
    const collected: Signal[] = [];
    // Newest first; walk pages until one is short or older than the last poll.
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await apiCall<ListResponse<Signal>>({
        auth,
        path: '/signals',
        scope: 'read:signals',
        query: { minStrength: propsValue.minStrength, type: propsValue.signalType, limit: PAGE, offset: page * PAGE },
      });
      const batch = res.data ?? [];
      collected.push(...batch);
      if (batch.length < PAGE) break;
      const oldest = Math.min(...batch.map((s) => Date.parse(s.createdAt) || 0));
      if (lastFetchEpochMS && oldest < lastFetchEpochMS) break;
    }
    return collected.map((s) => ({ epochMilliSeconds: Date.parse(s.createdAt) || Date.now(), data: s }));
  },
};

export const newSignal = createTrigger({
  auth: signalravenAuth,
  name: 'new_signal',
  displayName: 'New Signal',
  description: 'Triggers when SignalRaven qualifies a new buying-intent signal. Polls the API; use New Signal (Webhook) for instant delivery.',
  aiMetadata: {
    description: 'Fires for each new SignalRaven buying-intent signal: a named person with title, company, strength score, why it matters, suggested opener and talking points. Polling; supports minimum strength and type filters.',
  },
  props: {
    minStrength: shared.minStrength,
    signalType: shared.signalType,
  },
  sampleData: {
    id: '3f9c2a1e-0000-4000-8000-000000000001',
    type: 'KEYWORD_SEARCH_COMMENT',
    strength: 9,
    person: { name: 'Marcus Feld', title: 'Director of Corporate Events', company: 'Halvorsen Consulting', linkedinUrl: 'https://www.linkedin.com/in/example' },
    whyItMatters: 'Director of Corporate Events is actively talking about venue holds disappearing for next year\'s leadership summit.',
    suggestedOpener: 'Saw your note on venue holds disappearing for next year\'s summit. How far out are you sourcing now?',
    talkingPoints: ['Venue holds are disappearing earlier this cycle.', 'Summit planning is starting earlier.'],
    createdAt: '2026-09-15T14:02:00.000Z',
  },
  type: TriggerStrategy.POLLING,
  async test(context) {
    return pollingHelper.test(polling, context);
  },
  async onEnable(context) {
    const { store, auth, propsValue } = context;
    await pollingHelper.onEnable(polling, { store, auth, propsValue });
  },
  async onDisable(context) {
    const { store, auth, propsValue } = context;
    await pollingHelper.onDisable(polling, { store, auth, propsValue });
  },
  async run(context) {
    return pollingHelper.poll(polling, context);
  },
});
