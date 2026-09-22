import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const runPersonIntelligence = createAction({
  auth: signalravenAuth,
  name: 'run_person_intelligence',
  displayName: 'Run Person Intelligence',
  description: 'Start a person research report for a LinkedIn profile URL. Spends credits unless a recent report exists, in which case the cached report is returned.',
  audience: 'both',
  aiMetadata: { description: 'Starts a SignalRaven person research report for a LinkedIn profile URL, optionally attached to an account report. Returns the report id and status; cached: true means no credits were spent.' },
  props: {
    personUrl: Property.ShortText({ displayName: 'Person LinkedIn URL', description: 'For example https://www.linkedin.com/in/example', required: true }),
    sourceCompanyReportId: Property.ShortText({ displayName: 'Source Account Report ID', description: 'Optional account report id from List Intelligence Reports.', required: false }),
  },
  async run(context) {
    const { personUrl, sourceCompanyReportId } = context.propsValue;
    return apiCall({
      auth: context.auth,
      method: HttpMethod.POST,
      path: '/intelligence/people',
      scope: 'write:intelligence',
      body: { personUrl, sourceCompanyReportId: sourceCompanyReportId || undefined },
    });
  },
});
