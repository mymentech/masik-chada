export const CONTRACT_FALLBACK_ERROR_CODE = 'INTERNAL_SERVER_ERROR';

const directPassThroughCodes = new Set([
  'BAD_USER_INPUT',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  CONTRACT_FALLBACK_ERROR_CODE,
]);

const mappedCodes: Record<string, string> = {
  BAD_REQUEST: 'BAD_USER_INPUT',
  GRAPHQL_PARSE_FAILED: 'BAD_USER_INPUT',
  GRAPHQL_VALIDATION_FAILED: 'BAD_USER_INPUT',
  UNAUTHORIZED: 'UNAUTHENTICATED',
};

export function normalizeGraphqlErrorCode(rawCode?: string): string {
  if (!rawCode) {
    return CONTRACT_FALLBACK_ERROR_CODE;
  }

  const code = rawCode.toUpperCase();

  if (directPassThroughCodes.has(code)) {
    return code;
  }

  return mappedCodes[code] || CONTRACT_FALLBACK_ERROR_CODE;
}
