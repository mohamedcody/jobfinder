import { describe, it, expect } from 'vitest';
import { getApiErrorMessage, isRequestCanceled } from '../api-error';

describe('Api Error Utils', () => {
  it('should extract error message from axios response', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: 'Custom backend error',
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe('Custom backend error');
  });

  it('should fall back to default message', () => {
    const error = new Error('Network Error');
    expect(getApiErrorMessage(error)).toBe('Network Error');
  });

  it('should detect canceled request', () => {
    const error = { isAxiosError: true, code: 'ERR_CANCELED' };
    expect(isRequestCanceled(error)).toBe(true);
  });
});
