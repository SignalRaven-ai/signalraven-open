import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const getIcp = createAction({
  auth: signalravenAuth,
  name: 'get_icp',
  displayName: 'Get ICP',
  description: 'Fetch the workspace ideal customer profile: company size, industries, titles, personas and seniority.',
  audience: 'both',
  aiMetadata: { description: 'Returns the ideal customer profile that SignalRaven scores signals against: employee range, target industries, titles, personas and seniority.' },
  props: {
  },
  async run(context) {
    return apiCall({ auth: context.auth, path: '/icp', scope: 'read:icp' });
  },
});
