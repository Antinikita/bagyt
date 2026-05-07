import { describe, it, expect, vi } from 'vitest';
import { extractApiError } from '../axios-client';

vi.mock('../../i18n', () => ({
  default: {
    t: (key) => `[${key}]`,
  },
}));

describe('extractApiError', () => {
  it('returns the rate-limit i18n key when the error is flagged as rate-limited', () => {
    expect(extractApiError({ isRateLimited: true })).toBe('[common.rateLimited]');
  });

  it('extracts the structured envelope error.message for unmapped codes', () => {
    const err = { response: { data: { error: { code: 'SOME_UNMAPPED_CODE', message: 'Backend went sideways' } } } };
    expect(extractApiError(err)).toBe('Backend went sideways');
  });

  it('extracts the first message from the Laravel validation errors envelope', () => {
    const err = {
      response: {
        data: {
          errors: {
            email: ['The email field must be a valid email address.'],
            password: ['The password field is required.'],
          },
        },
      },
    };
    expect(extractApiError(err)).toBe('The email field must be a valid email address.');
  });

  it('handles a string-valued errors entry (defensive shape)', () => {
    const err = { response: { data: { errors: { email: 'taken' } } } };
    expect(extractApiError(err)).toBe('taken');
  });

  it('falls back to legacy { message } shape', () => {
    const err = { response: { data: { message: 'Something blew up' } } };
    expect(extractApiError(err)).toBe('Something blew up');
  });

  it('falls back to the i18n key when nothing else matches', () => {
    expect(extractApiError({})).toBe('[common.somethingWentWrong]');
    expect(extractApiError({}, 'errors.notFound')).toBe('[errors.notFound]');
  });

  it('survives null / undefined input', () => {
    expect(extractApiError(null)).toBe('[common.somethingWentWrong]');
    expect(extractApiError(undefined)).toBe('[common.somethingWentWrong]');
  });

  it('maps AI_UPSTREAM_FAILED in the response envelope to the dedicated i18n key', () => {
    const err = {
      response: {
        data: {
          error: {
            code: 'AI_UPSTREAM_FAILED',
            message: 'Failed to generate AI response',
          },
        },
      },
    };
    expect(extractApiError(err)).toBe('[errors.aiServiceDown]');
  });

  it('maps AI_UPSTREAM_FAILED on a directly-thrown Error (sseStream path)', () => {
    const err = new Error('Stream failed: 502');
    err.code = 'AI_UPSTREAM_FAILED';
    err.status = 502;
    expect(extractApiError(err)).toBe('[errors.aiServiceDown]');
  });

  it('falls through to upstream message for unknown codes', () => {
    const err = {
      response: {
        data: { error: { code: 'NOT_A_KNOWN_CODE', message: 'whatever' } },
      },
    };
    expect(extractApiError(err)).toBe('whatever');
  });
});
