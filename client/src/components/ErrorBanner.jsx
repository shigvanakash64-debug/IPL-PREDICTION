export default function ErrorBanner({ message }) {
  return (
    <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
      {message}
    </div>
  );
}
