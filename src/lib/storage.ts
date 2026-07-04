// Local persistence for user-entered app data.
// Everything the user fills in (profile, medications, logs, entries) is stored
// in the browser via localStorage, namespaced per local "account" so that
// creating or switching accounts on the same browser never shows one user's
// data to another.

const PREFIX = "memoir:";
const ACTIVE_USER_KEY = `${PREFIX}__activeUserId`;
const ACCOUNTS_KEY = `${PREFIX}__accounts`;
const ANONYMOUS_ID = "anonymous";

interface AccountRecord {
  userId: string;
  name: string;
}

export function getActiveUserId(): string {
  if (typeof window === "undefined") return ANONYMOUS_ID;
  return window.localStorage.getItem(ACTIVE_USER_KEY) || ANONYMOUS_ID;
}

export function setActiveUserId(userId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_USER_KEY, userId);
}

export function clearActiveUserId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_USER_KEY);
}

function generateUserId(): string {
  return `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function readAccounts(): Record<string, AccountRecord> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function findAccountByEmail(email: string): AccountRecord | null {
  return readAccounts()[email.trim().toLowerCase()] || null;
}

/** Registers a brand-new account and returns its fresh, isolated userId. */
export function registerAccount(email: string, name: string): string {
  const userId = generateUserId();
  if (typeof window !== "undefined") {
    const accounts = readAccounts();
    accounts[email.trim().toLowerCase()] = { userId, name };
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  return userId;
}

export function removeAccountByEmail(email: string): void {
  if (typeof window === "undefined") return;
  const accounts = readAccounts();
  delete accounts[email.trim().toLowerCase()];
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function storageKey(key: string): string {
  return `${PREFIX}${getActiveUserId()}:${key}`;
}

export function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // storage full or unavailable — ignore, data just won't persist
  }
}

export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

/** Exports only the currently active account's data — never other accounts'. */
export function exportAllState(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const userPrefix = `${PREFIX}${getActiveUserId()}:`;
  const result: Record<string, unknown> = {};
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(userPrefix))
    .forEach((k) => {
      try {
        result[k.slice(userPrefix.length)] = JSON.parse(window.localStorage.getItem(k) || "null");
      } catch {
        // skip unparseable entries
      }
    });
  return result;
}

/** Deletes only the currently active account's data — other accounts on this browser are untouched. */
export function clearActiveUserState(): void {
  if (typeof window === "undefined") return;
  const userPrefix = `${PREFIX}${getActiveUserId()}:`;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(userPrefix))
    .forEach((k) => window.localStorage.removeItem(k));
}
