import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard({ authUser, onLogout, api }) {
  const [questions, setQuestions] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsResponse, betsResponse] = await Promise.all([
          api.get('/questions'),
          api.get('/bets'),
        ]);

        setQuestions(questionsResponse.data.questions || []);
        setBets(betsResponse.data.bets || []);
      } catch (err) {
        setError('Unable to load questions or bets.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [api]);

  const navigate = useNavigate();

  const handleBet = (questionId, selectedOption) => {
    navigate('/bet', {
      state: {
        questionId,
        selectedOption,
      },
    });
  };

  const betByQuestion = bets.reduce((acc, bet) => {
    acc[bet.questionId] = bet;
    return acc;
  }, {});

  const historyItems = bets.filter((bet) => bet.paymentStatus === 'approved');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">User dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back, {authUser.name}</h1>
          <p className="mt-2 text-sm text-slate-400">Browse current pool questions.</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Logout
        </button>
      </header>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Questions</h2>
            <p className="mt-1 text-sm text-slate-400">See the latest pool predictions available.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">Role: {authUser.role}</div>
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              {showHistory ? 'Hide history' : 'Show history'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-slate-400">Loading questions…</div>
        ) : error ? (
          <p className="mt-6 text-rose-400">{error}</p>
        ) : questions.length === 0 ? (
          <p className="mt-6 text-slate-400">No questions have been created yet.</p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-1">
              {questions.map((question) => {
                const existingBet = betByQuestion[question._id];
                const isClosed = question.status === 'closed';

                return (
                  <div key={question._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Pool Prediction</p>
                        <h3 className="mt-3 text-lg font-semibold text-white">{question.text}</h3>
                      </div>
                      <span className={`rounded-2xl px-3 py-2 text-sm font-semibold ${isClosed ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'}`}>
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-2">
                      {question.options.map((option, index) => {
                        const selected = existingBet?.selectedOption === option;
                        const isDisabled = isClosed || selected;
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleBet(question._id, option)}
                            className={`rounded-3xl border px-4 py-3 text-center text-lg font-semibold transition duration-200 ${
                              selected
                                ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                                : 'border-slate-700 bg-slate-900 text-white hover:border-cyan-400 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pool Displays */}
                    <div className="mt-6 space-y-4">
                      {['10', '20', '50', '100'].map((amount) => {
                        const pool = question.pools[amount];
                        const total = pool.optionA_count + pool.optionB_count;
                        const optionA = question.options[0];
                        const optionB = question.options[1];
                        const popular = pool.optionA_count > pool.optionB_count ? optionA : pool.optionB_count > pool.optionA_count ? optionB : null;
                        return (
                          <div key={amount} className="rounded-2xl bg-slate-900 p-4">
                            <h4 className="text-sm font-semibold text-cyan-400">₹{amount} Pool</h4>
                            <div className="mt-2 flex justify-between text-sm text-slate-300">
                              <span>{optionA}: {pool.optionA_count} users</span>
                              <span>{optionB}: {pool.optionB_count} users</span>
                            </div>
                            {popular && (
                              <p className="mt-1 text-xs text-emerald-400">🔥 Most Popular: {popular}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {existingBet ? (
                      <p className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-emerald-300">
                        Bet placed: <span className="font-semibold text-white">{existingBet.selectedOption}</span> - ₹{existingBet.amount} ({existingBet.paymentStatus})
                      </p>
                    ) : isClosed ? (
                      <p className="mt-4 rounded-2xl bg-rose-950 px-4 py-3 text-sm text-rose-300">Betting Closed</p>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">Select an option to place your bet.</p>
                    )}
                  </div>
                );
              })}
            </div>

            {showHistory && (
              <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">History</h2>
                    <p className="mt-1 text-sm text-slate-400">Approved payment history from admin review.</p>
                  </div>
                  <span className="rounded-2xl bg-emerald-950/80 px-4 py-3 text-sm text-emerald-300">{historyItems.length} approved record(s)</span>
                </div>

                {historyItems.length === 0 ? (
                  <p className="mt-6 text-slate-400">No approved bets yet.</p>
                ) : (
                  <div className="mt-6 space-y-4">
                    {historyItems.map((bet) => (
                      <div key={bet._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                        <p className="text-sm text-slate-400">
                          Bet on {bet.questionText} - {bet.selectedOption} - ₹{bet.amount}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>Status: {bet.paymentStatus}</span>
                          <span>Amount: ₹{bet.amount}</span>
                          <span>Created: {new Date(bet.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </section>
    </div>
  );
}
