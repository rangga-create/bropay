import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import '../styles/transfer.css';

const Transfer: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'recipient' | 'amount' | 'review' | 'success' | 'failed'>('recipient');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (step === 'recipient') {
      if (!recipient.trim()) {
        setError('Enter a recipient name or email to continue.');
        return;
      }
      setStep('amount');
    } else if (step === 'amount') {
      if (!amount || parseFloat(amount) <= 0) {
        setError('Enter an amount greater than zero.');
        return;
      }
      setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'amount') setStep('recipient');
    else if (step === 'review') setStep('amount');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.transactions.create({
        name: recipient,
        type: 'expense',
        amount: parseFloat(amount)
      });
      setStep('success');
    } catch (_err) {
      setError('Transaction failed. Please try again.');
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('recipient');
    setRecipient('');
    setAmount('');
    setNote('');
    setError('');
  };

  const amountValue = parseFloat(amount) || 0;

  return (
    <div className="transfer-page">
      <div className="page-header">
        <h1>Send Money</h1>
        <button className="btn-outline" onClick={() => navigate('/wallet')}>
          <ArrowLeft size={18} />
          <span>Back to Wallet</span>
        </button>
      </div>

      <div className="transfer-container">
        <div className="transfer-progress">
          <div className={`progress-step ${step === 'recipient' || step === 'amount' || step === 'review' ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <span>Recipient</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step === 'amount' || step === 'review' ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span>Amount</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step === 'review' ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span>Review</span>
          </div>
        </div>

        <div className="transfer-card">
          {step === 'recipient' && (
            <div className="transfer-form">
              <h3>Who are you sending to?</h3>
              {error && <p className="form-error">{error}</p>}
              <div className="input-group">
                <label>Recipient Name or Email</label>
                <input 
                  type="text" 
                  placeholder="Enter name or email" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="btn-primary" onClick={handleNext}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 'amount' && (
            <div className="transfer-form">
              <h3>How much?</h3>
              {error && <p className="form-error">{error}</p>}
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label>Note (optional)</label>
                <input 
                  type="text" 
                  placeholder="What's this for?" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="btn-group">
                <button className="btn-secondary" onClick={handleBack}>Back</button>
                <button className="btn-primary" onClick={handleNext}>
                  Review <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="transfer-review">
              <h3>Review Transfer</h3>
              <div className="review-details">
                <div className="review-row">
                  <span>Recipient</span>
                  <strong>{recipient}</strong>
                </div>
                <div className="review-row">
                  <span>Amount</span>
                  <strong className="amount">${parseFloat(amount).toFixed(2)}</strong>
                </div>
                {note && (
                  <div className="review-row">
                    <span>Note</span>
                    <strong>{note}</strong>
                  </div>
                )}
                <div className="review-row total">
                  <span>Total</span>
                  <strong>${parseFloat(amount).toFixed(2)}</strong>
                </div>
              </div>
              <div className="btn-group">
                <button className="btn-secondary" onClick={handleBack}>Back</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm & Send'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="transfer-result">
              <div className="result-icon success">
                <CheckCircle2 size={64} />
              </div>
              <h3>Transfer Successful!</h3>
              <p>You sent ${parseFloat(amount).toFixed(2)} to {recipient}</p>
              <button className="btn-primary" onClick={() => { handleClose(); navigate('/dashboard'); }}>
                Done
              </button>
            </div>
          )}

          {step === 'failed' && (
            <div className="transfer-result">
              <div className="result-icon failed">
                <XCircle size={64} />
              </div>
              <h3>Transfer Failed</h3>
              <p>{error}</p>
              <button className="btn-primary" onClick={handleClose}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;
