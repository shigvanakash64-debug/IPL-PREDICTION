import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const toIST = (value) => {
  const date = new Date(value);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 330 * 60000);
};

const getStatus = (cutoffTime) => {
  if (!cutoffTime) return 'Open';
  const now = toIST(new Date());
  const cutoff = toIST(cutoffTime);
  return now.getTime() > cutoff.getTime() ? 'Closed' : 'Open';
};

const formatIST = (cutoffTime) => {
  if (!cutoffTime) return '6:30 PM IST';
  const date = toIST(cutoffTime);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHour}:${minutes} ${ampm} IST`;
};

const getCountdown = (cutoffTime) => {
  if (!cutoffTime) return null;
  const now = toIST(new Date()).getTime();
  const target = toIST(cutoffTime).getTime();
  const diff = target - now;
  if (diff <= 0) return null;
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h ${minutes}m ${seconds}s`;
};

export default function BetPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { predictionId, option, question, cutoffTime } = location.state || {};
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState('');

  const status = useMemo(() => getStatus(cutoffTime), [cutoffTime]);
  const isClosed = status === 'Closed';

  useEffect(() => {
    if (!cutoffTime) return;
    const tick = () => {
      const next = getCountdown(cutoffTime);
      setCountdown(next || 'Closed');
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [cutoffTime]);

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

    if (isClosed) {
      setError('Prediction is closed. You cannot place a bet after the cutoff.');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/predictions/${predictionId}/amount`, { amount: numericAmount });
      navigate('/payment', {
        state: {
          amount: numericAmount,
          predictionId,
          option,
          question,
          cutoffTime,
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
            <p className="mt-2 text-sm text-slate-400">
              Cutoff: <span className="font-semibold text-white">{formatIST(cutoffTime)}</span>
            </p>
            <p className="text-sm text-slate-400">Status: <span className="font-semibold text-white">{status}</span></p>
            {countdown && status === 'Open' ? (
              <p className="text-sm text-emerald-300">Time left: {countdown}</p>
            ) : null}
            {isClosed ? (
              <p className="mt-3 rounded-2xl bg-rose-950 px-4 py-3 text-sm text-rose-300">Prediction Closed</p>
            ) : null}
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
              disabled={isClosed}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || isClosed}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving…' : isClosed ? 'Closed' : 'Confirm and Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
