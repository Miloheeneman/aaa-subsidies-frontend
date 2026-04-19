const TOKEN_KEY = "aaa_token";
const USER_CACHE_KEY = "aaa_user";

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore (private mode etc.)
  }
  window.dispatchEvent(new Event("aaa_auth_changed"));
}

export function removeToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("aaa_auth_changed"));
}

export function isLoggedIn() {
  const tok = getToken();
  if (!tok) return false;
  const payload = decodeJwtPayload(tok);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    removeToken();
    return false;
  }
  return true;
}

export function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const [, body] = token.split(".");
    if (!body) return null;
    const normalized = body.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "===".slice((normalized.length + 3) % 4);
    const json = atob(padded);
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

/**
 * Returns a minimal user object derived from the JWT payload, or null.
 * Shape: { id, email, role, organisation_id }
 */
export function getCurrentUser() {
  const payload = decodeJwtPayload(getToken());
  if (!payload) return null;
  return {
    id: payload.sub ?? null,
    email: payload.email ?? null,
    role: payload.role ?? null,
    organisation_id: payload.organisation_id ?? null,
  };
}

export function setCachedMe(me) {
  try {
    window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(me));
    window.dispatchEvent(new Event("aaa_auth_changed"));
  } catch {
    // ignore
  }
}

export function getCachedMe() {
  try {
    const raw = window.localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function onAuthChange(handler) {
  const wrapped = () => handler();
  window.addEventListener("aaa_auth_changed", wrapped);
  window.addEventListener("storage", wrapped);
  return () => {
    window.removeEventListener("aaa_auth_changed", wrapped);
    window.removeEventListener("storage", wrapped);
  };
}

export const AUTH_STORAGE_KEY = TOKEN_KEY;
