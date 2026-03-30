import { useEffect, useState } from 'react';

export default function AdminPanel({ authUser, onLogout, api }) {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!text || !option1 || !option2) {
      setError('All fields are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await api.post('/admin/question', { text, option1, option2 });
      setQuestions((current) => [response.data.question, ...current]);
      setText('');
      setOption1('');
      setOption2('');
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

        <button
          type="button"
          onClick={onLogout}
          className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Logout
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
          <h2 className="text-xl font-semibold text-white">Create question</h2>
          <p className="mt-2 text-sm text-slate-400">Add a new two-option match prediction.</p>

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
              <label className="block text-sm font-medium text-slate-200">Option 1</label>
              <input
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Option 2</label>
              <input
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
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
            <p><span className="font-semibold text-slate-100">Email:</span> {authUser.email}</p>
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
    </div>
  );
}
