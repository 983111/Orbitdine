export type AuthUser = {
  id: string;
  username: string;
  role: 'manager' | 'owner';
};

const TOKEN_KEY = 'orbitdine_token';
const USER_KEY = 'orbitdine_user';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveAuthSession = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const authHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
