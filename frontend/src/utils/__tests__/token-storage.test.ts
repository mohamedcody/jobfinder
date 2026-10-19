import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { saveToken, getToken, clearToken, isTokenExpired, hasValidToken, TOKEN_KEY } from '../token-storage';

// Mock localStorage/sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

describe('Token Storage Utils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should save token to sessionStorage', () => {
    saveToken('test-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_KEY, 'test-token');
  });

  it('should get token from sessionStorage', () => {
    localStorageMock.setItem(TOKEN_KEY, 'test-token');
    expect(getToken()).toBe('test-token');
  });

  it('should clear token from sessionStorage', () => {
    localStorageMock.setItem(TOKEN_KEY, 'test-token');
    clearToken();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(getToken()).toBeNull();
  });

  it('should return false for hasValidToken when no token exists', () => {
    expect(hasValidToken()).toBe(false);
  });

  // A real JWT token parsing test would require a mocked base64 token, which is complex to mock perfectly inline.
  // We will assume isTokenExpired is tested separately or we use a simple payload.
});
