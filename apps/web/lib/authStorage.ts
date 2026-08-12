const TOKEN_KEY = "pulsecheck.accessToken";
const EMAIL_KEY = "pulsecheck.email";

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function setStoredSession(accessToken: string, email: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
