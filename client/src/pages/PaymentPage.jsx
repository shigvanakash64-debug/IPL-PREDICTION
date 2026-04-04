import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UPI_NAME, UPI_OPTIONS, GOOGLE_FORM_BASE_URL } from '../config/paymentConfig';

const toIST = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 330 * 60000);
};

const getStatus = (cutoffTime) => {
  if (!cutoffTime) return 'Open';
  const now = toIST(new Date());
  const cutoff = toIST(cutoffTime);
  if (!cutoff) return 'Open';
  return now.getTime() > cutoff.getTime() ? 'Closed' : 'Open';
};

const buildGoogleFormUrl = ({ username, amount, betId }) => {
  const params = new URLSearchParams({
    'entry.1999690954': username,
    'entry.1897096866': amount,
    'entry.1838227550': `BET_${betId}`,
  });
  return `${GOOGLE_FORM_BASE_URL}&${params.toString()}`;
};

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { betId, questionId, selectedOption, amount } = location.state || {};
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null);

  const copyUpiId = async (upiId) => {
    if (!upiId) return;
    try {
      await navigator.clipboard.writeText(upiId);
      setCopyMessage('UPI ID copied to clipboard.');
    } catch {
      setCopyMessage('Unable to copy. Please copy manually.');
    }
    setTimeout(() => setCopyMessage(''), 3000);
  };

  const getScannerQrUrl = (upiId) => {
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(UPI_NAME)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(`BET_${betId}`)}`;
    return `https://chart.googleapis.com/chart?cht=qr&chs=280x280&chl=${encodeURIComponent(upiLink)}&chld=L|1`;
  };

  const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <path d="M9 4H6C4.895 4 4 4.895 4 6V17C4 18.105 4.895 19 6 19H17C18.105 19 19 18.105 19 17V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
  const ScannerIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <path d="M5 7V5a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 7V5a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 17v2a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 17v2a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 12a4 4 0 0 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
  const isClosed = false; // No cutoff for pool
  const usernameValue = 'User';
  const visibleUpiOptions = UPI_OPTIONS.slice(0, 10);
  const hasDisabledUpiOptions = visibleUpiOptions.some((optionItem) => !optionItem.enabled);

  const openScanner = (optionItem) => {
    if (!optionItem?.id) return;
    setScannerTarget(optionItem);
    setShowScanner(true);
  };

  const closeScanner = () => {
    setScannerTarget(null);
    setShowScanner(false);
  };

  if (!betId || !amount) {
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

    if (!optionItem?.enabled) {
      setError('This UPI option is not active yet. Please use the active option above.');
      return;
    }

    const upiId = optionItem.id;
    if (!upiId) {
      setError('Invalid UPI option selected. Please choose another option.');
      return;
    }

    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(UPI_NAME)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(`BET_${betId}`)}`;
    window.location.href = upiLink;
  };

  const handleConfirmPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Amount is required before submitting payment proof.');
      return;
    }

    if (!betId) {
      setError('Bet not found. Unable to continue.');
      return;
    }

    setError('');
    setConfirming(true);

    try {
      await api.post('/bets/confirm-payment');
      const formUrl = buildGoogleFormUrl({ username: 'User', amount, betId });
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
            <p className="mt-2 text-slate-400">Choose a UPI option and pay the exact amount. Make sure the note is saved as BET_{betId}.</p>
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
            <p className="mt-2 text-lg font-semibold text-white">BET_{betId}</p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Select UPI option</p>
            <div className="grid gap-3">
              {visibleUpiOptions.map((optionItem) => {
                const isOptionDisabled = !optionItem.enabled;
                return (
                  <div key={optionItem.label} className="rounded-3xl border border-slate-700 bg-slate-800 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => payWithUpi(optionItem)}
                          disabled={isOptionDisabled}
                          className={`flex-1 rounded-3xl px-5 py-4 text-left text-sm font-semibold transition ${isOptionDisabled ? 'bg-slate-950 text-slate-500 cursor-not-allowed opacity-60' : 'bg-slate-800 text-white hover:border-cyan-400 hover:bg-cyan-700'}`}
                      >
                        <span>{optionItem.label}</span>
                        {isOptionDisabled && <span className="block text-xs font-normal text-slate-400">Disabled until added</span>}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            copyUpiId(optionItem.id);
                          }}
                          disabled={isOptionDisabled}
                          className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-700 bg-slate-900 text-slate-300 transition ${isOptionDisabled ? 'cursor-not-allowed opacity-50' : 'hover:border-cyan-400 hover:text-white'}`}
                          title={isOptionDisabled ? 'UPI option not active yet' : `Copy ${optionItem.label}`}
                        >
                          <CopyIcon />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openScanner(optionItem);
                          }}
                          disabled={isOptionDisabled}
                          className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-700 bg-slate-900 text-slate-300 transition ${isOptionDisabled ? 'cursor-not-allowed opacity-50' : 'hover:border-cyan-400 hover:text-white'}`}
                          title={isOptionDisabled ? 'Scanner not available yet' : `Open scanner for ${optionItem.label}`}
                        >
                          <ScannerIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {copyMessage && <p className="text-sm text-emerald-300">{copyMessage}</p>}
            </div>
            {hasDisabledUpiOptions && (
              <p className="mt-3 text-sm text-slate-400">Some UPI options are not active yet. Use an enabled option and copy/scan from its row.</p>
            )}
          </div>

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        {confirmationMessage && <p className="mt-4 text-sm text-emerald-300">{confirmationMessage}</p>}

        <div className="mt-8">
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirming ? 'Processing…' : 'I have paid'}
          </button>
        </div>
      </div>

      {showScanner && scannerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeScanner}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700"
            >
              <span className="text-lg font-bold">×</span>
            </button>
            <h2 className="text-lg font-semibold text-white">Scanner preview</h2>
            <p className="mt-2 text-sm text-slate-400">Scan this code from your UPI app to pay to <span className="font-semibold text-white">{scannerTarget.label}</span>.</p>
            <p className="mt-1 text-sm text-slate-400">UPI ID: <span className="font-semibold text-white">{scannerTarget.id}</span></p>
            <div className="mt-6 flex flex-col items-center gap-4">
              <img
                src={getScannerQrUrl(scannerTarget.id)}
                alt={`QR code for ${scannerTarget.label}`}
                className="h-72 w-72 rounded-3xl border border-slate-700 bg-slate-950 object-cover"
              />
              <div className="w-full rounded-3xl border border-slate-700 bg-slate-900 p-4 text-center">
                <p className="text-sm text-slate-400">Scanner preview for:</p>
                <p className="mt-2 text-base font-semibold text-white">{scannerTarget.label}</p>
                <p className="mt-2 text-sm text-slate-400">Amount ₹{amount}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.35em] text-slate-500">Payment note</p>
                <p className="text-sm font-semibold text-white">PRED_{predictionId}</p>
                <p className="mt-3 text-xs text-slate-500">If the QR does not scan, use the UPI ID shown above.</p>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-slate-400">Scan this code with your UPI app, or copy the UPI ID shown above.</p>
          </div>
        </div>
      )}
    </div>
  );
}
