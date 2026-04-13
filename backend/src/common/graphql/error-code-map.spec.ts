import { describe, expect, it } from 'vitest';
import { CONTRACT_FALLBACK_ERROR_CODE, normalizeGraphqlErrorCode } from './error-code-map';

describe('normalizeGraphqlErrorCode', () => {
  it('passes through contract codes unchanged', () => {
    expect(normalizeGraphqlErrorCode('BAD_USER_INPUT')).toBe('BAD_USER_INPUT');
    expect(normalizeGraphqlErrorCode('UNAUTHENTICATED')).toBe('UNAUTHENTICATED');
    expect(normalizeGraphqlErrorCode('FORBIDDEN')).toBe('FORBIDDEN');
    expect(normalizeGraphqlErrorCode('NOT_FOUND')).toBe('NOT_FOUND');
    expect(normalizeGraphqlErrorCode('CONFLICT')).toBe('CONFLICT');
    expect(normalizeGraphqlErrorCode('INTERNAL_SERVER_ERROR')).toBe('INTERNAL_SERVER_ERROR');
  });

  it('maps framework codes to contract codes', () => {
    expect(normalizeGraphqlErrorCode('BAD_REQUEST')).toBe('BAD_USER_INPUT');
    expect(normalizeGraphqlErrorCode('UNAUTHORIZED')).toBe('UNAUTHENTICATED');
    expect(normalizeGraphqlErrorCode('GRAPHQL_VALIDATION_FAILED')).toBe('BAD_USER_INPUT');
  });

  it('falls back for missing and unknown codes', () => {
    expect(normalizeGraphqlErrorCode()).toBe(CONTRACT_FALLBACK_ERROR_CODE);
    expect(normalizeGraphqlErrorCode('SOME_UNKNOWN_CODE')).toBe(CONTRACT_FALLBACK_ERROR_CODE);
  });
});
