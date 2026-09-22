import { Property } from '@activepieces/pieces-framework';

export const minStrength = Property.Number({
  displayName: 'Minimum Strength',
  description: 'Only signals with a strength score at or above this value, 0 to 10. Use 7 for warm, 9 for the strongest.',
  required: false,
});
export const signalType = Property.ShortText({
  displayName: 'Signal Type',
  description: 'Filter by signal type, for example KEYWORD_SEARCH_COMMENT or COMPANY_PAGE_REACTION. Leave empty for all types.',
  required: false,
});
export const limit = Property.Number({
  displayName: 'Limit',
  description: 'Maximum number of results, up to 100.',
  required: false,
  defaultValue: 25,
});
export const offset = Property.Number({
  displayName: 'Offset',
  description: 'Number of results to skip, for paging.',
  required: false,
  defaultValue: 0,
});
