import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const getPersonIntelligence = createAction({
  auth: signalravenAuth,
  name: 'get_person_intelligence',
  displayName: 'Get Person Intelligence',
  description: 'Fetch a person research report: who they are, what they engaged with, the ICP read, and talking points.',
  audience: 'both',
  aiMetadata: { description: 'Fetches one SignalRaven person research report by id: profile summary, engagement history, ICP read and talking points. Ids come from List Intelligence Reports.' },
  props: {
    reportId: Property.ShortText({ displayName: 'Report ID', description: 'A person report id from List Intelligence Reports.', required: true }),
  },
  async run(context) {
    return apiCall({
      auth: context.auth,
      path: `/intelligence/people/${encodeURIComponent(context.propsValue.reportId)}`,
      scope: 'read:intelligence',
    });
  },
});
