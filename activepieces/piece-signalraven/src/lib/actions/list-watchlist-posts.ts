import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { signalravenAuth } from '../auth';
import { apiCall } from '../common/client';
import * as shared from '../common/props';

export const listWatchlistPosts = createAction({
  auth: signalravenAuth,
  name: 'list_watchlist_posts',
  displayName: 'List Watchlist Posts',
  description: 'List posts from the watchlist, the named accounts and people being tracked.',
  audience: 'both',
  aiMetadata: { description: 'Lists recent LinkedIn posts from the accounts and people on the SignalRaven watchlist, with paging.' },
  props: {
    limit: shared.limit,
    offset: shared.offset,
  },
  async run(context) {
    const { limit, offset } = context.propsValue;
    return apiCall({ auth: context.auth, path: '/watchlist', scope: 'read:watchlist', query: { limit, offset } });
  },
});
