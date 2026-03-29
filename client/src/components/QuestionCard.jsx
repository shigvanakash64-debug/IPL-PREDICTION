export default function QuestionCard({ question, onVote, disabled }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Vote now</p>
        <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{question.question}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onVote('A')}
          disabled={disabled}
          className="rounded-3xl border border-slate-700 bg-slate-950 px-6 py-5 text-left text-lg font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="block text-sm text-slate-400">Option A</span>
          <span className="mt-3 block text-xl">{question.optionA}</span>
        </button>

        <button
          type="button"
          onClick={() => onVote('B')}
          disabled={disabled}
          className="rounded-3xl border border-slate-700 bg-slate-950 px-6 py-5 text-left text-lg font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="block text-sm text-slate-400">Option B</span>
          <span className="mt-3 block text-xl">{question.optionB}</span>
        </button>
      </div>

      <p className="text-sm text-slate-500">Tap one side and see live results instantly.</p>
    </div>
  );
}
