import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPanel({ authUser, onLogout, api }) {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(true);
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [predictionsError, setPredictionsError] = useState('');

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/questions');
      setQuestions(response.data.questions || []);
    } catch (err) {
      setError('Unable to load admin questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setPredictionsLoading(true);
    setPredictionsError('');
    try {
      const response = await api.get('/admin/predictions');
      setPredictions(response.data.predictions || []);
    } catch (err) {
      setPredictionsError('Unable to load payment predictions.');
    } finally {
      setPredictionsLoading(false);
    }
  };

  const handlePaymentStatus = async (id, status) => {
    setPredictionsError('');
    try {
      const response = await api.patch(`/admin/predictions/${id}/status`, { status });
      setPredictions((current) => current.map((item) => (item._id === id ? response.data.prediction : item)));
    } catch (err) {
      setPredictionsError(err?.response?.data?.error || 'Unable to update payment status.');
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const cleanedOptions = options.map((option) => option.trim()).filter(Boolean);
    if (!text || cleanedOptions.length < 2) {
      setError('Question text and at least two options are required.');
      return;
    }

    if (cleanedOptions.length > 5) {
      setError('A question can have at most five options.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await api.post('/admin/question', { text, options: cleanedOptions });
      setQuestions((current) => [response.data.question, ...current]);
      setText('');
      setOptions(['', '']);
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to create question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/admin/question/${id}`);
      setQuestions((current) => current.filter((question) => question._id !== id));
    } catch (err) {
      setError('Unable to delete question.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Admin panel</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Hello, {authUser.name}</h1>
          <p className="mt-2 text-sm text-slate-400">Create and manage prediction questions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/payments"
            className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Review payments
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
          <h2 className="text-xl font-semibold text-white">Create question</h2>
          <p className="mt-2 text-sm text-slate-400">Add a new question with 2 to 5 options.</p>

          <form className="mt-6 space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium text-slate-200">Question</label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
            {options.map((optionValue, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-slate-200">Option {index + 1}</label>
                <div className="mt-2 flex gap-3">
                  <input
                    value={optionValue}
                    onChange={(e) => setOptions((current) => current.map((item, idx) => idx === index ? e.target.value : item))}
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setOptions((current) => current.filter((_, idx) => idx !== index))}
                      className="inline-flex h-12 items-center rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            {options.length < 5 && (
              <button
                type="button"
                onClick={() => setOptions((current) => [...current, ''])}
                className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                Add option
              </button>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Create question'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
          <h2 className="text-xl font-semibold text-white">Admin info</h2>
          <p className="mt-2 text-sm text-slate-400">Only admins can access this panel.</p>
          <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-sm text-slate-300">
            <p><span className="font-semibold text-slate-100">Username:</span> {authUser.username}</p>
            <p className="mt-2"><span className="font-semibold text-slate-100">Role:</span> {authUser.role}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Existing questions</h2>
            <p className="mt-1 text-sm text-slate-400">Delete questions when they are no longer needed.</p>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-400">Loading questions…</p>
        ) : error ? (
          <p className="mt-6 text-rose-400">{error}</p>
        ) : questions.length === 0 ? (
          <p className="mt-6 text-slate-400">No questions created yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {questions.map((question) => (
              <div key={question._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Question</p>
                    <h3 className="mt-3 text-lg font-semibold text-white">{question.text}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.options.map((option, index) => (
                        <span key={index} className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-200">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(question._id)}
                    className="mt-3 rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 sm:mt-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Payment verification</h2>
            <p className="mt-1 text-sm text-slate-400">Approve or reject pending payments after manual verification.</p>
          </div>
        </div>

        {predictionsLoading ? (
          <p className="mt-6 text-slate-400">Loading payment requests…</p>
        ) : predictionsError ? (
          <p className="mt-6 text-rose-400">{predictionsError}</p>
        ) : predictions.length === 0 ? (
          <p className="mt-6 text-slate-400">No payment records available yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Payment review</p>
                    <h3 className="mt-3 text-lg font-semibold text-white">{prediction.username || 'Unknown user'}</h3>
                    <p className="mt-2 text-sm text-slate-400">Prediction ID: <span className="font-semibold text-white">{prediction._id}</span></p>
                    <p className="mt-1 text-sm text-slate-400">Note: <span className="font-semibold text-white">PRED_{prediction._id}</span></p>
                    <p className="mt-1 text-sm text-slate-400">Amount: <span className="font-semibold text-white">₹{prediction.amount || 0}</span></p>
                    <p className="mt-1 text-sm text-slate-400">Status: <span className="font-semibold text-white">{prediction.paymentStatus}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={prediction.paymentStatus === 'paid'}
                      onClick={() => handlePaymentStatus(prediction._id, 'paid')}
                      className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={prediction.paymentStatus === 'rejected'}
                      onClick={() => handlePaymentStatus(prediction._id, 'rejected')}
                      className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
