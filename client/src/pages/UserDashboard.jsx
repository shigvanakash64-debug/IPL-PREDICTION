import { useEffect, useState } from 'react';

export default function UserDashboard({ authUser, onLogout, api }) {
  const [questions, setQuestions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsResponse, predictionsResponse] = await Promise.all([
          api.get('/questions'),
          api.get('/predictions'),
        ]);

        setQuestions(questionsResponse.data.questions || []);
        setPredictions(predictionsResponse.data.predictions || []);
      } catch (err) {
        setError('Unable to load questions or predictions.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [api]);

  const handlePredict = async (questionId, option) => {
    setError('');
    setSubmittingQuestion(questionId);

    try {
      const response = await api.post('/predictions', { questionId, option });
      if (response.data?.prediction) {
        setPredictions((prev) => [...prev, response.data.prediction]);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to submit prediction.');
    } finally {
      setSubmittingQuestion(null);
    }
  };

  const predictionByQuestion = predictions.reduce((acc, item) => {
    acc[item.matchId] = item;
    return acc;
  }, {});

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
            {questions.map((question) => {
              const existingPrediction = predictionByQuestion[question._id];
              const isSubmitting = submittingQuestion === question._id;

              return (
                <div key={question._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Prediction</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{question.text}</h3>
                  <div className="mt-4 grid gap-3">
                    {question.options.map((option) => {
                      const selected = existingPrediction?.selectedOption === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={Boolean(existingPrediction) || isSubmitting}
                          onClick={() => handlePredict(question._id, option)}
                          className={`rounded-3xl border px-4 py-3 text-left text-lg font-semibold transition duration-200 ${
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

                  {existingPrediction ? (
                    <p className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-emerald-300">
                      Prediction submitted: <span className="font-semibold text-white">{existingPrediction.selectedOption}</span>
                    </p>
                  ) : isSubmitting ? (
                    <p className="mt-4 text-sm text-slate-400">Submitting prediction…</p>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">Choose one option. One prediction per question.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
