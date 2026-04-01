import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getISTDate = (value) => {
  const date = new Date(value);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 330 * 60000);
};

const getQuestionStatus = (cutoffTime) => {
  if (!cutoffTime) return 'Open';
  const nowIst = getISTDate(new Date());
  const cutoffIst = getISTDate(cutoffTime);
  return nowIst.getTime() > cutoffIst.getTime() ? 'Closed' : 'Open';
};

const formatIST = (cutoffTime) => {
  if (!cutoffTime) return '6:30 PM IST';
  const ist = getISTDate(cutoffTime);
  const hours = ist.getHours();
  const minutes = String(ist.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHour}:${minutes} ${ampm} IST`;
};

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

  const navigate = useNavigate();

  const handlePredict = async (questionId, option, questionText, cutoffTime) => {
    setError('');
    setSubmittingQuestion(questionId);

    try {
      const response = await api.post('/predictions', { questionId, option });
      const prediction = response.data?.prediction;
      if (prediction) {
        setPredictions((prev) => [
          ...prev.filter((item) => item._id !== prediction._id),
          prediction,
        ]);
        navigate('/bet', {
          state: {
            predictionId: prediction._id,
            questionId,
            option,
            question: questionText,
            cutoffTime,
            username: authUser.username || authUser.name || 'Participant',
          },
        });
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
              const status = question.status || getQuestionStatus(question.cutoffTime);
              const isClosed = status === 'Closed';

              return (
                <div key={question._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Prediction</p>
                      <h3 className="mt-3 text-lg font-semibold text-white">{question.text}</h3>
                    </div>
                    <span className={`rounded-2xl px-3 py-2 text-sm font-semibold ${isClosed ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'}`}>
                      {isClosed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Cutoff: {formatIST(question.cutoffTime)}</p>
                  <div className="mt-4 grid gap-3">
                    {question.options.map((option) => {
                      const selected = existingPrediction?.selectedOption === option;
                      const isDisabled = isSubmitting || isClosed || selected;
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handlePredict(question._id, option, question.text, question.cutoffTime)}
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
                    <>
                      <p className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-emerald-300">
                        Prediction submitted: <span className="font-semibold text-white">{existingPrediction.selectedOption}</span>
                      </p>
                      {!isClosed && (
                        <p className="mt-3 text-sm text-slate-400">You can change your selection until cutoff time.</p>
                      )}
                    </>
                  ) : isSubmitting ? (
                    <p className="mt-4 text-sm text-slate-400">Submitting prediction…</p>
                  ) : isClosed ? (
                    <p className="mt-4 rounded-2xl bg-rose-950 px-4 py-3 text-sm text-rose-300">Prediction Closed</p>
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
