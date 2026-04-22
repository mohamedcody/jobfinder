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

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Decode base64 to UTF-8 properly to avoid atob errors with Unicode characters
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error("JWT Decode Error:", error);
    return null;
  }
};

export const saveToken = (token: string) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(TOKEN_KEY, token);
  notifyAuthSessionChange();
};

export const getToken = (): string | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(TOKEN_KEY);
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
