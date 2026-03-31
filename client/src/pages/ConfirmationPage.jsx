import { Link, useLocation } from 'react-router-dom';

export default function ConfirmationPage() {
  const location = useLocation();
  const { amount, predictionId } = location.state || {};

  if (!predictionId) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">No confirmation data</h1>
        <p className="mt-3 text-slate-400">Please retry from the dashboard.</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-glow text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Payment confirmed</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Thank you!</h1>
      <p className="mt-4 text-slate-400">We have recorded your payment attempt for the selected prediction.</p>
      <div className="mt-6 space-y-3 rounded-3xl bg-slate-950 p-5 text-left">
        <p className="text-sm text-slate-400">Prediction ID</p>
        <p className="text-lg font-semibold text-white break-all">{predictionId}</p>
        <p className="text-sm text-slate-400">Amount</p>
        <p className="text-lg font-semibold text-white">₹{amount}</p>
      </div>
      <p className="mt-5 text-sm text-slate-400">Your payment is marked as pending. We will manually verify it using the UPI note.</p>
      <Link to="/dashboard" className="mt-6 inline-flex rounded-3xl bg-cyan-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
        Back to dashboard
      </Link>
    </div>
  );
}
