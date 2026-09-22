import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const listSignals = createAction({
  auth: signalravenAuth,
  name: 'list_signals',
  displayName: 'List Signals',
  description: 'List qualified buying-intent signals, newest first, with optional minimum strength and type filters.',
  audience: 'both',
  aiMetadata: { description: 'Lists SignalRaven buying-intent signals: each carries the person\'s company, LinkedIn profile and location, a strength score out of 10, why it matters, a suggested opener and talking points. Supports minStrength and type filters and paging.' },
  props: {
    minStrength: shared.minStrength,
    signalType: shared.signalType,
    limit: shared.limit,
    offset: shared.offset,
  },
  async run(context) {
    const { minStrength, signalType, limit, offset } = context.propsValue;
    return apiCall({
      auth: context.auth,
      path: '/signals',
      scope: 'read:signals',
      query: { minStrength, type: signalType, limit, offset },
    });
  },
});
