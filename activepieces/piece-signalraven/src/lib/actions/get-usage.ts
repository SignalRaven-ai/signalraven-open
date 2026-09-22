import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const getUsage = createAction({
  auth: signalravenAuth,
  name: 'get_usage',
  displayName: 'Get Usage',
  description: 'Fetch workspace activity counts (signals, sources, reports) and the system status.',
  audience: 'both',
  aiMetadata: { description: 'Returns SignalRaven workspace activity counts and whether the pipeline is operational. Counts only, no billing figures.' },
  props: {
  },
  async run(context) {
    return apiCall({ auth: context.auth, path: '/usage', scope: 'read:usage' });
  },
});
