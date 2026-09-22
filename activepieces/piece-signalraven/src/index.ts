import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { signalravenAuth } from './lib/auth';
import { BASE_URL, getToken, READ_SCOPES } from './lib/common/client';
import { listSignals } from './lib/actions/list-signals';
import { getSignal } from './lib/actions/get-signal';
import { listSources } from './lib/actions/list-sources';
import { getIcp } from './lib/actions/get-icp';
import { listWatchlistPosts } from './lib/actions/list-watchlist-posts';
import { listIntelligenceReports } from './lib/actions/list-intelligence-reports';
import { getAccountIntelligence } from './lib/actions/get-account-intelligence';
import { getPersonIntelligence } from './lib/actions/get-person-intelligence';
import { runAccountIntelligence } from './lib/actions/run-account-intelligence';
import { runPersonIntelligence } from './lib/actions/run-person-intelligence';
import { getUsage } from './lib/actions/get-usage';
import { newSignal } from './lib/triggers/new-signal';
import { newSignalWebhook } from './lib/triggers/new-signal-webhook';

export const signalraven = createPiece({
  displayName: 'SignalRaven',
  description: 'LinkedIn buying-intent signals, prospect and account research, and openers from your SignalRaven workspace.',
  auth: signalravenAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://signalraven.ai/sr-icon.png',
  authors: ['signalraven'],
  categories: [PieceCategory.SALES_AND_CRM],
  actions: [
    listSignals,
    getSignal,
    listSources,
    getIcp,
    listWatchlistPosts,
    listIntelligenceReports,
    getAccountIntelligence,
    getPersonIntelligence,
    runAccountIntelligence,
    runPersonIntelligence,
    getUsage,
    createCustomApiCallAction({
      baseUrl: () => BASE_URL,
      auth: signalravenAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${await getToken(auth, READ_SCOPES)}`,
      }),
    }),
  ],
  triggers: [newSignal, newSignalWebhook],
});
