export default function Loader() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="flex items-center gap-3 rounded-3xl bg-slate-950 p-8 shadow-glow">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        <p className="text-base text-slate-300">Loading questions...</p>
      </div>
    </div>
  );
}
