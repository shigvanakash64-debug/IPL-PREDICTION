export default function ResultCard({ question, result, selectedOption }) {
  const { votesA, votesB, totalVotes, percentA, percentB } = result;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Live results</p>
        <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{question.question}</h2>
      </div>

      <div className="space-y-4 rounded-3xl bg-slate-950 p-5">
        <div className={`rounded-3xl border p-5 ${selectedOption === 'A' ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Option A</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{question.optionA}</h3>
            </div>
            <span className="text-sm font-semibold text-cyan-300">{percentA}%</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${percentA}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">{votesA} votes</p>
        </div>

        <div className={`rounded-3xl border p-5 ${selectedOption === 'B' ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Option B</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{question.optionB}</h3>
            </div>
            <span className="text-sm font-semibold text-cyan-300">{percentB}%</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${percentB}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">{votesB} votes</p>
        </div>
      </div>

      <p className="text-center text-sm text-slate-400">Total votes: {totalVotes}</p>
    </div>
  );
}
