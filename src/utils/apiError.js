export function parseApiError(err, fallback = 'Unexpected error') {
  const data = err?.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    const firstMessage = Object.values(data.errors)
      .flat()
      .find((m) => typeof m === 'string' && m.length > 0);
    if (firstMessage) return firstMessage;
  }
  if (typeof data?.message === 'string' && data.message.length > 0) {
    return data.message;
  }
  if (typeof err?.message === 'string' && err.message.length > 0) {
    return err.message;
  }
  return fallback;
}
