import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import Button from '../ui/Button';

export default function MessageInput({ onSubmit, sending }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    onSubmit(text);
  };

  return (
    <form
      onSubmit={submit}
      className="border-t border-gray-200 bg-white/80 p-4 backdrop-blur dark:border-deep-700 dark:bg-deep-800/80"
    >
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          placeholder={t('chats.inputPlaceholder')}
          rows={2}
          maxLength={4000}
          disabled={sending}
          className="flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-brand-400 disabled:opacity-50 dark:border-deep-700 dark:bg-deep-900 dark:text-white dark:placeholder-gray-500"
        />
        <Button type="submit" variant="primary" loading={sending} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
