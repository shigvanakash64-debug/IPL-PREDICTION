import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPayments({ authUser, onLogout, api }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');

  const loadPredictions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/predictions?status=${encodeURIComponent(filterStatus)}`);
      setPredictions(response.data.predictions || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to load payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, [filterStatus]);

  const filteredPredictions = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) {
      return predictions;
    }

    return predictions.filter((prediction) => {
      const username = prediction.username || '';
      const id = prediction._id || '';
      const note = prediction.paymentNote || '';
      return (
        username.toLowerCase().includes(searchTerm) ||
        id.toLowerCase().includes(searchTerm) ||
        note.toLowerCase().includes(searchTerm)
      );
    });
  }, [predictions, search]);

  const updatePredictionStatus = async (id, endpoint) => {
    setActionError('');
    setActionLoading(id);
    try {
      const response = await api.patch(`/admin/predictions/${id}/${endpoint}`);
      const updatedPrediction = response.data.prediction;

      setPredictions((current) => {
        if (filterStatus === 'pending' && updatedPrediction.paymentStatus !== 'pending') {
          return current.filter((item) => item._id !== id);
        }

        return current.map((item) => (item._id === id ? updatedPrediction : item));
      });
    } catch (err) {
      setActionError(err?.response?.data?.error || 'Unable to update payment status.');
    } finally {
      setActionLoading('');
    }
  };

  const statusLabel = (status) => {
    if (status === 'paid') return 'Paid';
    if (status === 'rejected') return 'Rejected';
    if (status === 'pending') return 'Pending';
    return status;
  };

  const statusClass = (status) => {
    if (status === 'paid') return 'border-emerald-500 bg-emerald-950/20';
    if (status === 'rejected') return 'border-rose-500 bg-rose-950/20';
    if (status === 'pending') return 'border-amber-400 bg-amber-950/20';
    return 'border-slate-700 bg-slate-950/50';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Admin payment review</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Pending payment approvals</h1>
          <p className="mt-2 text-sm text-slate-400">Review predictions, approve payments, and sync approved records to Google Sheets.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin"
            className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            Back to admin dashboard
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

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Filter payments</h2>
              <p className="mt-2 text-sm text-slate-400">Choose a status or search by username / prediction ID.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-200">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              >
                <option value="pending">Pending</option>
                <option value="paid">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Username or prediction ID"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {actionError && <p className="text-sm text-rose-400">{actionError}</p>}
          <p className="text-sm text-slate-400">Showing {filteredPredictions.length} record(s).</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
          <h2 className="text-xl font-semibold text-white">Quick tips</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>Approve only after verifying the payment note and amount.</li>
            <li>Approved payments are synced to the Google Sheets webhook.</li>
            <li>Rejected payments stay in the system for audit.</li>
          </ul>
        </div>
      </section>

      {loading ? (
        <p className="text-slate-400">Loading payment requests…</p>
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : filteredPredictions.length === 0 ? (
        <p className="text-slate-400">No payments found for this filter.</p>
      ) : (
        <div className="space-y-4">
          {filteredPredictions.map((prediction) => (
            <div key={prediction._id} className={`rounded-3xl border p-5 shadow-glow ${statusClass(prediction.paymentStatus)}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm uppercase tracking-[0.35em] text-cyan-400">
                    <span>Payment review</span>
                    <span className="text-slate-500">•</span>
                    <span>{statusLabel(prediction.paymentStatus)}</span>
                  </div>
                  <p className="text-base font-semibold text-white">Username: {prediction.username || 'unknown'}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">Question:</span> {prediction.questionType?.toUpperCase()}</p>
                    <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">Option:</span> {prediction.selectedOption}</p>
                    <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">Amount:</span> ₹{prediction.amount || 0}</p>
                    <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">Prediction ID:</span> PRED_{prediction._id}</p>
                  </div>
                  <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">Note:</span> {prediction.paymentNote || `PRED_${prediction._id}`}</p>
                  <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">Timestamp:</span> {new Date(prediction.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={prediction.paymentStatus === 'paid' || actionLoading === prediction._id}
                    onClick={() => updatePredictionStatus(prediction._id, 'approve')}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === prediction._id ? 'Processing…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={prediction.paymentStatus === 'rejected' || actionLoading === prediction._id}
                    onClick={() => updatePredictionStatus(prediction._id, 'reject')}
                    className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
