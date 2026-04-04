import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPanel({ authUser, onLogout, api }) {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [loading, setLoading] = useState(true);
  const [betsLoading, setBetsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [bets, setBets] = useState([]);
  const [betsError, setBetsError] = useState('');

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
    loadBets();
  }, []);

  const loadBets = async () => {
    setBetsLoading(true);
    setBetsError('');
    try {
      const response = await api.get('/admin/bets');
      setBets(response.data.bets || []);
    } catch (err) {
      setBetsError('Unable to load pending bets.');
    } finally {
      setBetsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setBetsError('');
    try {
      await api.patch(`/admin/bets/${id}/approve`);
      setBets((current) => current.filter((item) => item._id !== id));
      loadQuestions(); // Refresh pools
    } catch (err) {
      setBetsError(err?.response?.data?.error || 'Unable to approve bet.');
    }
  };

  const handleReject = async (id) => {
    setBetsError('');
    try {
      await api.patch(`/admin/bets/${id}/reject`);
      setBets((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setBetsError(err?.response?.data?.error || 'Unable to reject bet.');
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!text || !optionA || !optionB) {
      setError('Question text and two options are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await api.post('/admin/question', { text, optionA, optionB });
      setQuestions((current) => [response.data.question, ...current]);
      setText('');
      setOptionA('');
      setOptionB('');
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
          <p className="mt-2 text-sm text-slate-400">Add a new pool question with 2 options.</p>

          <form className="mt-6 space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium text-slate-200">Question</label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Option A</label>
              <input
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Option B</label>
              <input
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

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
            <h2 className="text-xl font-semibold text-white">Bet verification</h2>
            <p className="mt-1 text-sm text-slate-400">Approve or reject pending bets after manual verification.</p>
          </div>
        </div>

        {betsLoading ? (
          <p className="mt-6 text-slate-400">Loading bet requests…</p>
        ) : betsError ? (
          <p className="mt-6 text-rose-400">{betsError}</p>
        ) : bets.length === 0 ? (
          <p className="mt-6 text-slate-400">No pending bets.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {bets.map((bet) => (
              <div key={bet._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Bet review</p>
                    <h3 className="mt-3 text-lg font-semibold text-white">{bet.userId?.name || 'Unknown user'}</h3>
                    <p className="mt-2 text-sm text-slate-400">Question: <span className="font-semibold text-white">{bet.questionId?.text}</span></p>
                    <p className="mt-1 text-sm text-slate-400">Selected: <span className="font-semibold text-white">{bet.selectedOption}</span></p>
                    <p className="mt-1 text-sm text-slate-400">Amount: <span className="font-semibold text-white">₹{bet.amount}</span></p>
                    <p className="mt-1 text-sm text-slate-400">Status: <span className="font-semibold text-white">{bet.paymentStatus}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(bet._id)}
                      className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(bet._id)}
                      className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
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
