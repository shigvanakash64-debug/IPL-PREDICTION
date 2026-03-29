import { useEffect, useMemo, useState } from 'react';
import api from './api';
import QuestionCard from './components/QuestionCard';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';

const VOTE_STORAGE_KEY = 'binary-prediction-votes';
const USER_ID_KEY = 'binary-prediction-user-id';

const getUserIdentifier = () => {
  let storedId = localStorage.getItem(USER_ID_KEY);
  if (!storedId) {
    storedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`;
    localStorage.setItem(USER_ID_KEY, storedId);
  }
  return storedId;
};

function App() {
  const [questions, setQuestions] = useState([]);
  const [localVotes, setLocalVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedVotes = localStorage.getItem(VOTE_STORAGE_KEY);
    if (storedVotes) {
      try {
        setLocalVotes(JSON.parse(storedVotes));
      } catch (err) {
        localStorage.removeItem(VOTE_STORAGE_KEY);
      }
    }
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/questions');
      setQuestions(response.data);
    } catch (err) {
      setError('Unable to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const activeQuestion = questions[0] || null;
  const selectedOption = activeQuestion ? localVotes[activeQuestion._id] : null;

  const resultData = useMemo(() => {
    if (!activeQuestion) return null;
    const votesA = activeQuestion.votesA || 0;
    const votesB = activeQuestion.votesB || 0;
    const totalVotes = votesA + votesB;
    const percentA = totalVotes ? Math.round((votesA / totalVotes) * 100) : 0;
    const percentB = totalVotes ? Math.round((votesB / totalVotes) * 100) : 0;
    return { votesA, votesB, totalVotes, percentA, percentB };
  }, [activeQuestion]);

  const handleVote = async (option) => {
    if (!activeQuestion || selectedOption || voting) return;

    setVoting(true);
    setError('');

    try {
      const response = await api.post('/vote', {
        questionId: activeQuestion._id,
        selectedOption: option,
        userIdentifier: getUserIdentifier(),
      });

      const updatedQuestion = {
        ...activeQuestion,
        votesA: response.data.votesA,
        votesB: response.data.votesB,
      };

      setQuestions((current) =>
        current.map((question) =>
          question._id === activeQuestion._id ? updatedQuestion : question
        )
      );

      const nextVotes = { ...localVotes, [activeQuestion._id]: option };
      localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(nextVotes));
      setLocalVotes(nextVotes);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to submit your vote. Try again.');
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-cyan-400 uppercase tracking-[0.35em] text-sm">Binary Prediction</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Predict which side will win.</h1>
          <p className="mt-4 text-slate-400">Vote once per question, then compare live percentage results.</p>
        </header>

        {error && <ErrorBanner message={error} />}

        <main className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow backdrop-blur-xl">
          {loading ? (
            <Loader />
          ) : !activeQuestion ? (
            <div className="space-y-4 text-center text-slate-400">
              <p>No questions available yet.</p>
              <button
                type="button"
                onClick={fetchQuestions}
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Refresh
              </button>
            </div>
          ) : selectedOption ? (
            <ResultCard question={activeQuestion} result={resultData} selectedOption={selectedOption} />
          ) : (
            <QuestionCard
              question={activeQuestion}
              onVote={handleVote}
              disabled={voting}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
