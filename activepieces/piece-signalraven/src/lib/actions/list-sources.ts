import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const listSources = createAction({
  auth: signalravenAuth,
  name: 'list_sources',
  displayName: 'List Sources',
  description: 'List the LinkedIn sources being monitored, with signal counts and a strength score for each.',
  audience: 'both',
  aiMetadata: { description: 'Lists the LinkedIn sources a SignalRaven workspace monitors with per-source metrics over a period of 7 days, 30 days or all time.' },
  props: {
    period: Property.StaticDropdown({
      displayName: 'Period',
      description: 'Metrics window.',
      required: false,
      defaultValue: '30',
      options: { options: [{ label: '7 days', value: '7' }, { label: '30 days', value: '30' }, { label: 'All time', value: 'all' }] },
    }),
  },
  async run(context) {
    return apiCall({
      auth: context.auth,
      path: '/sources',
      scope: 'read:sources',
      query: { period: context.propsValue.period },
    });
  },
});
