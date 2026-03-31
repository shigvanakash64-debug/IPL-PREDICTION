import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const UPI_ID = 'yourupi@okicici';
const UPI_NAME = 'YourName';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, predictionId, option, question } = location.state || {};
  const [error, setError] = useState('');

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

  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(`PRED_${predictionId}`)}`;

  const handlePayNow = () => {
    setError('');
    try {
      window.location.href = upiLink;
    } catch (err) {
      setError('Unable to open UPI app. Please copy the UPI ID and pay manually.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-glow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">UPI payment</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Complete your payment</h1>
            <p className="mt-2 text-slate-400">Use the UPI app to pay the exact amount and note the transaction carefully.</p>
          </div>
          <Link to="/dashboard" className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
            Cancel and return
          </Link>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">UPI ID</p>
            <p className="mt-2 text-lg font-semibold text-white">{UPI_ID}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Amount</p>
            <p className="mt-2 text-lg font-semibold text-white">₹{amount}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Payment note</p>
            <p className="mt-2 text-lg font-semibold text-white">PRED_{predictionId}</p>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={handlePayNow}
            className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Pay Now
          </button>
          <button
            type="button"
            onClick={() => navigate('/confirmation', { state: { amount, predictionId } })}
            className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-slate-800 px-5 py-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:bg-slate-700"
          >
            I have paid
          </button>
        </div>
      </div>
    </div>
  );
}
