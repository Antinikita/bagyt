import { Bot } from 'lucide-react';

export default function StreamingBubble({ text }) {
  return (
    <div className="flex gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-deep-700 dark:text-gray-300">
        <Bot className="h-4 w-4" />
      </span>
      <div className="max-w-[75%] whitespace-pre-wrap rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900 dark:bg-deep-700 dark:text-gray-100">
        {text}
        <span className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 bg-current animate-pulse" />
      </div>
    </div>
  );
}
