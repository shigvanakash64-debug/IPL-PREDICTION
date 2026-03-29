import { useEffect, useMemo, useState } from 'react';
import api from './api';
import QuestionCard from './components/QuestionCard';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';

const PREDICTION_STORAGE_KEY = 'binary-prediction-predictions';
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
  const [matches, setMatches] = useState([]);
  const [localPredictions, setLocalPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedPredictions = localStorage.getItem(PREDICTION_STORAGE_KEY);
    if (storedPredictions) {
      try {
        setLocalPredictions(JSON.parse(storedPredictions));
      } catch (err) {
        localStorage.removeItem(PREDICTION_STORAGE_KEY);
      }
    }
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');

    try {
      getUserIdentifier();
      const response = await api.get('/matches');
      setMatches(response.data);
    } catch (err) {
      setError('Unable to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const activeMatch = matches[0] || null;
  const selectedTeam = activeMatch
    ? localPredictions[activeMatch.matchId] || activeMatch.userPrediction
    : null;

  const handlePredict = async (team) => {
    if (!activeMatch || selectedTeam || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await api.post(`/predict/${activeMatch.matchId}`, {
        selectedTeam: team,
      });

      const updatedMatch = {
        ...activeMatch,
        userPrediction: team,
        totalVotes: response.data.totalVotes ?? activeMatch.totalVotes + 1,
      };

      setMatches((current) =>
        current.map((item) =>
          item.matchId === activeMatch.matchId ? updatedMatch : item
        )
      );

      const nextPredictions = { ...localPredictions, [activeMatch.matchId]: team };
      localStorage.setItem(PREDICTION_STORAGE_KEY, JSON.stringify(nextPredictions));
      setLocalPredictions(nextPredictions);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to submit your prediction. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-cyan-400 uppercase tracking-[0.35em] text-sm">Live IPL Prediction</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Predict the next IPL winner.</h1>
          <p className="mt-4 text-slate-400">Choose one team per match and see your saved prediction.</p>
        </header>

        {error && <ErrorBanner message={error} />}

        <main className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow backdrop-blur-xl">
          {loading ? (
            <Loader />
          ) : !activeMatch ? (
            <div className="space-y-4 text-center text-slate-400">
              <p>No live or upcoming IPL matches available right now.</p>
              <button
                type="button"
                onClick={fetchMatches}
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Refresh
              </button>
            </div>
          ) : selectedTeam ? (
            <ResultCard match={activeMatch} selectedTeam={selectedTeam} />
          ) : (
            <QuestionCard
              match={activeMatch}
              onPredict={handlePredict}
              disabled={submitting}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
