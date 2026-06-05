export function FlagStripe({ className = "" }: { className?: string }) {
  // Kenyan flag horizontal stripe: black, white-edged red, white-edged green
  return (
    <div className={`flex h-1.5 w-full overflow-hidden ${className}`} aria-hidden="true">
      <div className="flex-1 bg-[oklch(0.18_0.02_260)]" />
      <div className="w-0.5 bg-white" />
      <div className="flex-1 bg-[oklch(0.55_0.22_28)]" />
      <div className="w-0.5 bg-white" />
      <div className="flex-1 bg-[oklch(0.5_0.16_150)]" />
    </div>
  );
}
