import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function BetPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questionId, selectedOption } = location.state || {};
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presetAmounts = [10, 20, 50, 100];

  if (!questionId || !selectedOption) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">No bet details</h1>
        <p className="mt-3 text-slate-400">Start by choosing an option from your dashboard.</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const handleSelectAmount = (value) => {
    setError('');
    setAmount(value);
  };

  const handleSubmit = async () => {
    setError('');

    if (!amount) {
      setError('Please select an amount.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/bets', { questionId, selectedOption, amount });
      const bet = response.data.bet;
      navigate('/payment', {
        state: {
          betId: bet._id,
          questionId,
          selectedOption,
          amount,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to create bet.');
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
            <h1 className="mt-2 text-3xl font-semibold text-white">Select amount</h1>
            <p className="mt-2 text-slate-400">Betting on <span className="font-semibold text-white">{selectedOption}</span>.</p>
          </div>
          <Link to="/dashboard" className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
            Back to dashboard
          </Link>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <p className="text-sm font-semibold text-slate-300">Choose your bet amount</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              {presetAmounts.map((preset) => {
                const isSelected = amount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectAmount(preset)}
                    className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                  >
                    ₹{preset}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !amount}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating bet…' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
