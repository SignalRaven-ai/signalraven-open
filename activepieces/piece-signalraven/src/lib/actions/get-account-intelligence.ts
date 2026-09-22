import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const getAccountIntelligence = createAction({
  auth: signalravenAuth,
  name: 'get_account_intelligence',
  displayName: 'Get Account Intelligence',
  description: 'Fetch an account research report: firmographics, the buying committee, disposition and openers.',
  audience: 'both',
  aiMetadata: { description: 'Fetches one SignalRaven account research report by id: firmographics, buying committee, ICP disposition and openers. Ids come from List Intelligence Reports.' },
  props: {
    reportId: Property.ShortText({ displayName: 'Report ID', description: 'An account report id from List Intelligence Reports.', required: true }),
  },
  async run(context) {
    return apiCall({
      auth: context.auth,
      path: `/intelligence/accounts/${encodeURIComponent(context.propsValue.reportId)}`,
      scope: 'read:intelligence',
    });
  },
});
