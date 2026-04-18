import { motion, useReducedMotion } from 'framer-motion';

export default function AuthCard({ title, subtitle, logo, children, footer, className = '' }) {
  const prefersReduced = useReducedMotion();
  const motionProps = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut' },
      };

  return (
    <div className={`w-full max-w-md px-4 ${className}`}>
      {logo && (
        <div className="mb-6 flex justify-center">
          {logo}
        </div>
      )}

      <motion.div
        {...motionProps}
        className="
          relative rounded-2xl border border-white/50 bg-white/70 p-7
          shadow-brand
          backdrop-blur-xl
          supports-[not(backdrop-filter:blur(0))]:bg-white
          dark:border-white/10 dark:bg-deep-800/60
          dark:supports-[not(backdrop-filter:blur(0))]:bg-deep-800
        "
      >
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </motion.div>

      {footer && (
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {footer}
        </p>
      )}
    </div>
  );
}
