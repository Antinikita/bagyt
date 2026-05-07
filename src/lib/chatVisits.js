/**
 * Tracks "last visited" timestamps per chat in localStorage.
 *
 * Used by the sidebar to surface recently-viewed chats first,
 * which is what users actually want when they navigate ("get me
 * back to the chat I was just looking at"), distinct from the
 * server's `updated_at` order ("most recent activity").
 *
 * Storage shape: { [chatId: string]: ISO_8601_timestamp_string }.
 * Bounded to MAX_ENTRIES so the localStorage row doesn't grow
 * unbounded for power users — when over the cap, we drop the
 * oldest visits.
 */

const STORAGE_KEY = 'bagyt:chat-visits:v1';
const MAX_ENTRIES = 200;

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeRaw(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage can throw (private mode quota, disabled). Silent fail —
    // sidebar just falls back to server's updated_at order.
  }
}

export function getChatVisits() {
  return readRaw();
}

export function recordChatVisit(chatId) {
  if (chatId == null) return;
  const map = readRaw();
  map[String(chatId)] = new Date().toISOString();

  // Keep only the most-recent MAX_ENTRIES entries.
  const entries = Object.entries(map);
  if (entries.length > MAX_ENTRIES) {
    entries.sort((a, b) => (a[1] < b[1] ? 1 : -1));
    const trimmed = Object.fromEntries(entries.slice(0, MAX_ENTRIES));
    writeRaw(trimmed);
    return;
  }
  writeRaw(map);
}

export function forgetChatVisit(chatId) {
  if (chatId == null) return;
  const map = readRaw();
  delete map[String(chatId)];
  writeRaw(map);
}
