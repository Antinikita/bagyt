const API_URL = import.meta.env.VITE_API_URL;

/**
 * Stream a chat message from Laravel's /chats/{id}/messages/stream endpoint.
 *
 * EventSource can't be used here: no POST body, no Authorization header. So we
 * use fetch + ReadableStream and parse the SSE framing ourselves.
 *
 * Backend event sequence: meta → delta* → final → saved (or error anywhere).
 *
 * @param {Object} opts
 * @param {number|string} opts.chatId
 * @param {string} opts.message
 * @param {AbortSignal} [opts.signal]
 * @param {(event: {event: string, data: any}) => void} opts.onEvent
 * @returns {Promise<void>} resolves when the stream closes cleanly
 */
export async function streamChatMessage({ chatId, message, locale, signal, onEvent }) {
  const token = localStorage.getItem('token');
  const body = locale ? { message, locale } : { message };
  const res = await fetch(`${API_URL}/chats/${chatId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    let detail = '';
    try { detail = (await res.text()).slice(0, 400); } catch {}
    throw new Error(`Stream failed: ${res.status} ${res.statusText} ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const parsed = parseSseEvent(rawEvent);
      if (parsed) onEvent(parsed);
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseEvent(buffer);
    if (parsed) onEvent(parsed);
  }
}

function parseSseEvent(raw) {
  let event = 'message';
  const dataLines = [];
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (!dataLines.length) return null;
  const raw_data = dataLines.join('\n');
  let data = raw_data;
  try { data = JSON.parse(raw_data); } catch {}
  return { event, data };
}
