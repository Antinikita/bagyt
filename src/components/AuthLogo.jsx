export default function AuthLogo() {
  return (
    <div className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className="
          inline-flex h-12 w-12 items-center justify-center rounded-2xl
          bg-white ring-1 ring-black/5 shadow-logo
        "
      >
        <img src="/logo-color.svg" alt="" className="h-10 w-10 object-contain" />
      </span>
      <span className="text-2xl t-wordmark">Bağyt</span>
    </div>
  );
}
