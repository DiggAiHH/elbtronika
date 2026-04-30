export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    </div>
  );
}
