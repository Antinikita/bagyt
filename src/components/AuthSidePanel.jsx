import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ChatPreview from './ChatPreview';
import DashboardPreview from './DashboardPreview';
import ViewToggle from './ViewToggle';

export default function AuthSidePanel() {
  const [view, setView] = useState('chat');
  const prefersReduced = useReducedMotion();

  const heading = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut' },
      };
  const sub = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut', delay: 0.08 },
      };

  return (
    <div className="w-full max-w-xl space-y-6 px-4">
      <div>
        <motion.p {...sub} className="t-section mb-3">
          AI medical assistant
        </motion.p>
        <motion.h2
          {...heading}
          className="t-display text-[32px] leading-[1.1] sm:text-[36px]"
        >
          AI-powered health assistant
        </motion.h2>
        <motion.p {...sub} className="mt-3 text-base text-gray-600 dark:text-gray-300">
          Analyze symptoms and get smart recommendations instantly.
        </motion.p>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {view === 'chat' ? <ChatPreview /> : <DashboardPreview />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center pt-2">
        <ViewToggle value={view} onChange={setView} />
      </div>
    </div>
  );
}
