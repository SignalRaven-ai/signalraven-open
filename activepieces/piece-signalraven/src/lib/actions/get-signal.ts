import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const getSignal = createAction({
  auth: signalravenAuth,
  name: 'get_signal',
  displayName: 'Get Signal',
  description: 'Fetch one signal: the person\'s company, LinkedIn profile and location, the ICP analysis, why it matters, the suggested opener and talking points.',
  audience: 'both',
  aiMetadata: { description: 'Fetches a single SignalRaven signal by id: the person\'s company, LinkedIn profile and location, the ICP analysis, why it matters, the suggested opener and talking points. Get the id from List Signals or the New Signal trigger.' },
  props: {
    signalId: Property.ShortText({ displayName: 'Signal ID', description: 'The id from List Signals or the New Signal trigger.', required: true }),
  },
  async run(context) {
    return apiCall({
      auth: context.auth,
      path: `/signals/${encodeURIComponent(context.propsValue.signalId)}`,
      scope: 'read:signals',
    });
  },
});
