export default function AuthLogo() {
  return (
    <div className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className="
          inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl
          ring-1 ring-black/5 shadow-logo dark:ring-white/10
        "
      >
        <img src="/logo-color.svg" alt="" className="h-full w-full object-cover" />
      </span>
      <span className="text-2xl t-wordmark">Bağyt</span>
    </div>
  );
}
