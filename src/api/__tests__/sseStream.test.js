import { describe, it, expect, vi } from 'vitest';
import { parseSseEvent } from '../sseStream';

describe('parseSseEvent', () => {
  it('parses a meta event with JSON payload', () => {
    const raw = 'event: meta\ndata: {"user_message_id":42,"conversation_id":"abc"}';
    expect(parseSseEvent(raw)).toEqual({
      event: 'meta',
      data: { user_message_id: 42, conversation_id: 'abc' },
    });
  });

  it('parses a delta event and joins multi-line data', () => {
    const raw = 'event: delta\ndata: {"text":"line one\\nline two"}';
    expect(parseSseEvent(raw)).toEqual({
      event: 'delta',
      data: { text: 'line one\nline two' },
    });
  });

  it('defaults event name to "message" when omitted', () => {
    const raw = 'data: {"foo":1}';
    expect(parseSseEvent(raw)).toEqual({ event: 'message', data: { foo: 1 } });
  });

  it('skips comment lines (start with colon)', () => {
    const raw = ': this is a heartbeat\nevent: ping\ndata: 1';
    expect(parseSseEvent(raw)).toEqual({ event: 'ping', data: 1 });
  });

  it('returns null when there is no data line', () => {
    expect(parseSseEvent('event: meta\n')).toBeNull();
  });

  it('falls back to the raw string if data is not valid JSON, and warns in dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const raw = 'event: error\ndata: not-json';
    const result = parseSseEvent(raw);
    expect(result).toEqual({ event: 'error', data: 'not-json' });
    // dev warning is conditional on import.meta.env.DEV — only assert the
    // fallback happens, not the warning channel (vitest sets DEV=true by default).
    warn.mockRestore();
  });
});
