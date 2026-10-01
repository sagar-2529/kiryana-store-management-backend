const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const TOKEN_KEY = "kiryana_admin_token";
const ADMIN_KEY = "kiryana_admin";

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  admin: () => JSON.parse(localStorage.getItem(ADMIN_KEY) || "null"),
  set: ({ token, admin }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
};

export async function api(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session.token() && { Authorization: `Bearer ${session.token()}` }),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) session.clear();
    throw new Error(body.error || "Something went wrong. Please try again.");
  }
  return body;
}

export { BASE_URL };
