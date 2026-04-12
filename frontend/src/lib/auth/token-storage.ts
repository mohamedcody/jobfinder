export const TOKEN_KEY = "jobfinder.auth.token";
export const AUTH_SESSION_EVENT = "jobfinder-auth-session-changed";

const isBrowser = () => typeof window !== "undefined";

const getStorage = (): Storage | null => {
  if (!isBrowser()) {
    return null;
  }

  // Session storage limits token lifetime to the current browser session.
  return window.sessionStorage;
};

const notifyAuthSessionChange = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

interface JwtPayload {
  exp?: number;
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
};

const migrateLegacyLocalStorageToken = (storage: Storage) => {
  if (!isBrowser()) {
    return;
  }

  const legacyToken = window.localStorage.getItem(TOKEN_KEY);
  if (legacyToken && !storage.getItem(TOKEN_KEY)) {
    storage.setItem(TOKEN_KEY, legacyToken);
  }
  window.localStorage.removeItem(TOKEN_KEY);
};

export const saveToken = (token: string) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(TOKEN_KEY, token);
  if (isBrowser()) {
    window.localStorage.removeItem(TOKEN_KEY);
  }
  notifyAuthSessionChange();
};

export const getToken = (): string | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  migrateLegacyLocalStorageToken(storage);
  return storage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(TOKEN_KEY);
  if (isBrowser()) {
    window.localStorage.removeItem(TOKEN_KEY);
  }
  notifyAuthSessionChange();
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
};

export const hasValidToken = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    clearToken();
    return false;
  }

  return true;
};
