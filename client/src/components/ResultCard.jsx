export default function ResultCard({ match, selectedTeam }) {
  const otherTeam = match.teamA === selectedTeam ? match.teamB : match.teamA;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Prediction saved</p>
        <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{match.teamA} vs {match.teamB}</h2>
        <p className="mt-3 text-sm text-slate-400">{match.venue || 'Venue unavailable'} • {new Date(match.startTime).toLocaleString()}</p>
      </div>

      <div className="rounded-3xl bg-slate-950 p-6">
        <div className="mb-4 rounded-3xl border border-cyan-400 bg-cyan-500/10 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Your pick</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{selectedTeam}</h3>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Opposing team</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{otherTeam}</h3>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-center">
        <p className="text-sm text-slate-400">Total predictions</p>
        <p className="mt-2 text-3xl font-semibold text-white">{match.totalVotes ?? 0}</p>
      </div>
    </div>
  );
}
