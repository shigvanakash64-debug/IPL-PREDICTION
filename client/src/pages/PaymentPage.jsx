import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UPI_NAME, UPI_OPTIONS, GOOGLE_FORM_BASE_URL } from '../config/paymentConfig';

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

const buildGoogleFormUrl = ({ fullName, amount, predictionId }) => {
  const params = new URLSearchParams({
    'entry.1999690954': fullName,
    'entry.1897096866': amount,
    'entry.1838227550': `PRED_${predictionId}`,
  });
  return `${GOOGLE_FORM_BASE_URL}&${params.toString()}`;
};

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, predictionId, option, question, cutoffTime, username } = location.state || {};
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const status = getStatus(cutoffTime);
  const isClosed = status === 'Closed';
  const displayName = username || 'Participant';

  if (!predictionId || !amount) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Payment details missing</h1>
        <p className="mt-3 text-slate-400">Please start from the dashboard and place your bet again.</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const payWithUpi = (optionItem) => {
    setError('');
    if (isClosed) {
      setError('Prediction is closed. Payment is no longer allowed.');
      return;
    }

    if (!optionItem?.enabled) {
      setError('This UPI option is not active yet. Please use the active option above.');
      return;
    }

    const upiId = optionItem.id;
    if (!upiId) {
      setError('Invalid UPI option selected. Please choose another option.');
      return;
    }

    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(UPI_NAME)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(`PRED_${predictionId}`)}`;
    window.location.href = upiLink;
  };

  const handleConfirmPayment = async () => {
    if (isClosed) {
      setError('Prediction is closed. You cannot confirm payment after cutoff.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Amount is required before submitting payment proof.');
      return;
    }

    if (!predictionId) {
      setError('Prediction not found. Unable to continue.');
      return;
    }

    setError('');
    setConfirming(true);

    try {
      await api.patch(`/predictions/${predictionId}/confirm`);
      const formUrl = buildGoogleFormUrl({ fullName: displayName, amount, predictionId });
      setConfirmationMessage('Please submit payment proof in the next step.');
      setTimeout(() => {
        window.open(formUrl, '_blank');
      }, 150);
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to confirm payment.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-glow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">UPI payment</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Complete your payment</h1>
            <p className="mt-2 text-slate-400">Choose a UPI option and pay the exact amount. Make sure the note is saved as PRED_{predictionId}.</p>
            <p className="mt-2 text-sm text-slate-400">Prediction status: <span className="font-semibold text-white">{status}</span></p>
            {isClosed && <p className="mt-2 rounded-2xl bg-rose-950 px-4 py-3 text-sm text-rose-300">Prediction Closed</p>}
          </div>
          <Link to="/dashboard" className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
            Cancel and return
          </Link>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Amount</p>
            <p className="mt-2 text-lg font-semibold text-white">₹{amount}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Payment note</p>
            <p className="mt-2 text-lg font-semibold text-white">PRED_{predictionId}</p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Select UPI option</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {UPI_OPTIONS.map((optionItem) => (
              <button
                key={optionItem.label}
                type="button"
                onClick={() => payWithUpi(optionItem)}
                disabled={isClosed || !optionItem.enabled}
                className={`rounded-3xl px-5 py-4 text-sm font-semibold transition ${optionItem.enabled ? 'border border-slate-700 bg-slate-800 text-white hover:border-cyan-400 hover:bg-cyan-700' : 'border border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed opacity-60'}`}
              >
                <span>{optionItem.label}</span>
                {!optionItem.enabled && <span className="block text-xs font-normal text-slate-500">Coming soon</span>}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        {confirmationMessage && <p className="mt-4 text-sm text-emerald-300">{confirmationMessage}</p>}

        <div className="mt-8">
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isClosed || confirming}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirming ? 'Processing…' : 'I have paid'}
          </button>
        </div>
      </div>
    </div>
  );
}
