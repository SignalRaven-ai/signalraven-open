import { PieceAuth, Property } from '@activepieces/pieces-framework';
import { getToken, READ_SCOPES } from './common/client';

export const signalravenAuth = PieceAuth.CustomAuth({
  required: true,
  description: `Create an API key in SignalRaven: **Settings → API keys** at [app.signalraven.ai](https://app.signalraven.ai). Copy the client id and client secret (shown once). Docs: https://signalraven.ai/developers`,
  props: {
    clientId: Property.ShortText({ displayName: 'Client ID', required: true }),
    clientSecret: PieceAuth.SecretText({ displayName: 'Client Secret', required: true }),
  },
  validate: async ({ auth }) => {
    try {
      await getToken(auth, [READ_SCOPES[0]]);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Token exchange failed. Check the client id and secret.' };
    }
  },
});
