import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function BetPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { predictionId, option, question } = location.state || {};
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!predictionId) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">No bet selected</h1>
        <p className="mt-3 text-slate-400">Start by choosing an option from your dashboard.</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/predictions/${predictionId}/payment`, { amount: numericAmount });
      navigate('/payment', {
        state: {
          amount: numericAmount,
          predictionId,
          option,
          question,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to save bet amount.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-glow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Place your bet</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Confirm amount</h1>
            <p className="mt-2 text-slate-400">Betting on <span className="font-semibold text-white">{option}</span> for <span className="font-semibold text-white">{question}</span>.</p>
          </div>
          <Link to="/dashboard" className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
            Back to dashboard
          </Link>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block text-sm font-semibold text-slate-300">
            Amount (INR)
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter bet amount"
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Confirm and Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
