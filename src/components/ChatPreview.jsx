import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const SCRIPT = [
  { role: 'user', text: 'I have a headache and feel tired.' },
  {
    role: 'ai',
    text: 'This may be related to stress or lack of sleep. Stay hydrated and rest. If symptoms persist, consult a doctor.',
  },
  { role: 'user', text: 'I slept only 4 hours last night.' },
  {
    role: 'ai',
    text: 'That could be a major factor. Try to maintain 7–8 hours of sleep regularly.',
  },
];

const USER_DELAY = 800;
const TYPING_DELAY = 1800;
const FIRST_DELAY = 300;

export default function ChatPreview() {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(prefersReduced ? SCRIPT.length : 0);
  const [typing, setTyping] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (prefersReduced) return;
    let cancelled = false;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    (async () => {
      for (let i = 0; i < SCRIPT.length; i++) {
        if (cancelled) return;
        if (SCRIPT[i].role === 'user') {
          await sleep(i === 0 ? FIRST_DELAY : USER_DELAY);
          if (cancelled) return;
          setVisible((c) => c + 1);
        } else {
          setTyping(true);
          await sleep(TYPING_DELAY);
          if (cancelled) return;
          setTyping(false);
          setVisible((c) => c + 1);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [prefersReduced]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [visible, typing]);

  const messages = SCRIPT.slice(0, visible);

  return (
    <div
      aria-label="AI chat preview"
      className="
        w-full rounded-2xl border border-white/50 bg-white/70 p-5
        shadow-brand backdrop-blur-xl
        supports-[not(backdrop-filter:blur(0))]:bg-white
        dark:border-white/10 dark:bg-deep-800/60
        dark:supports-[not(backdrop-filter:blur(0))]:bg-deep-800
      "
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="t-sm text-gray-900 dark:text-white">Bağyt Assistant</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Online · replies in seconds</p>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex h-[280px] flex-col gap-2.5 overflow-y-auto pr-1 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={i}
                initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={
                    isUser
                      ? 'max-w-[82%] rounded-2xl rounded-br-sm bg-brand-500 px-3.5 py-2 text-sm text-deep-700 shadow-pill'
                      : 'max-w-[82%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-800 shadow-sm dark:border-deep-700 dark:bg-deep-900 dark:text-gray-100'
                  }
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}

          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex justify-start"
              aria-label="Assistant is typing"
            >
              <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm dark:border-deep-700 dark:bg-deep-900">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-240ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
