/**
 * Auth helpers — store/retrieve JWT token from localStorage
 */

const TOKEN_KEY = 'calldesk_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      removeToken();
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function loginWithEmail(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  setToken(data.token);
  return data.user;
}

export async function registerWithEmail(name, email, password) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  setToken(data.token);
  return data.user;
}

export function loginWithGoogle() {
  window.location.href = `${API}/api/auth/google`;
}
