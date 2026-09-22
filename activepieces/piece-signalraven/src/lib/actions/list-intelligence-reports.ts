import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const listIntelligenceReports = createAction({
  auth: signalravenAuth,
  name: 'list_intelligence_reports',
  displayName: 'List Intelligence Reports',
  description: 'List person and account research reports, optionally filtered by type or a name search.',
  audience: 'both',
  aiMetadata: { description: 'Lists SignalRaven research reports (person or account), optionally filtered by type or matched by a person or company name such as Halvorsen Consulting.' },
  props: {
    reportType: Property.StaticDropdown({
      displayName: 'Report Type',
      required: false,
      options: { options: [{ label: 'All', value: 'all' }, { label: 'Account', value: 'account' }, { label: 'Person', value: 'person' }] },
    }),
    query: Property.ShortText({ displayName: 'Search', description: 'Match by person or company name.', required: false }),
    limit: shared.limit,
    offset: shared.offset,
  },
  async run(context) {
    const { reportType, query, limit, offset } = context.propsValue;
    return apiCall({
      auth: context.auth,
      path: '/intelligence',
      scope: 'read:intelligence',
      query: { type: reportType, q: query, limit, offset },
    });
  },
});
