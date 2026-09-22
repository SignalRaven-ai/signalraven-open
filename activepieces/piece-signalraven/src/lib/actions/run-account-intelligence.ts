import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const runAccountIntelligence = createAction({
  auth: signalravenAuth,
  name: 'run_account_intelligence',
  displayName: 'Run Account Intelligence',
  description: 'Start an account research report for a company LinkedIn URL. Spends credits unless a recent report exists, in which case the cached report is returned.',
  audience: 'both',
  aiMetadata: { description: 'Starts a SignalRaven account research report for a company LinkedIn URL. Returns the report id and status; cached: true means an existing report was returned without spending credits. A new report completes asynchronously.' },
  props: {
    companyUrl: Property.ShortText({ displayName: 'Company LinkedIn URL', description: 'For example https://www.linkedin.com/company/example', required: true }),
  },
  async run(context) {
    return apiCall({
      auth: context.auth,
      method: HttpMethod.POST,
      path: '/intelligence/accounts',
      scope: 'write:intelligence',
      body: { companyUrl: context.propsValue.companyUrl },
    });
  },
});
