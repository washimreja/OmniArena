export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <span className="text-xl font-bold text-accent animate-pulse">O</span>
        </div>
        <p className="text-sm text-text-muted">Loading Arena…</p>
      </div>
    </div>
  );
}
