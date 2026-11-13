const TOKEN_KEY = "testbook_access_token";

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage quota errors
  }
};

export const clearStoredToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
};
