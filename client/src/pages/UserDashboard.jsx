import { useEffect, useState } from 'react';

export default function UserDashboard({ authUser, onLogout, api }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await api.get('/questions');
        setQuestions(response.data.questions || []);
      } catch (err) {
        setError('Unable to load questions.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [api]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">User dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back, {authUser.name}</h1>
          <p className="mt-2 text-sm text-slate-400">Browse current prediction questions.</p>
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
            <p className="mt-1 text-sm text-slate-400">See the latest match predictions available to users.</p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">Role: {authUser.role}</div>
        </div>

        {loading ? (
          <div className="mt-6 text-slate-400">Loading questions…</div>
        ) : error ? (
          <p className="mt-6 text-rose-400">{error}</p>
        ) : questions.length === 0 ? (
          <p className="mt-6 text-slate-400">No questions have been created yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {questions.map((question) => (
              <div key={question._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Prediction</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{question.text}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.options.map((option, index) => (
                    <span key={index} className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-200">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
