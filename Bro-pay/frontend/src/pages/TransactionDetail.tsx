import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Download, Share2 } from 'lucide-react';
import { api } from '../services/api';
import '../styles/transaction-detail.css';

interface Transaction {
  id: number;
  name: string;
  type: string;
  amount: number;
  date: string;
  status?: string;
}

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const data = await api.transactions.get(Number(id));
        if (data.transaction) {
          setTransaction({ ...data.transaction, status: data.transaction.status || 'completed' });
        }
      } catch (_err) {
        console.error('Failed to fetch transaction');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="skeleton-box skeleton-card-box" style={{ height: 300 }}></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="detail-not-found">
        <h3>Transaction not found</h3>
        <button onClick={() => navigate('/transactions')}>Back to Transactions</button>
      </div>
    );
  }

  return (
    <div className="transaction-detail-page">
      <button className="back-link" onClick={() => navigate('/transactions')}>
        <ArrowLeft size={18} />
        Back to Transactions
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div className={`status-badge ${transaction.status}`}>
            {transaction.status === 'completed' && <CheckCircle2 size={16} />}
            {transaction.status === 'failed' && <XCircle size={16} />}
            {transaction.status === 'pending' && <Clock size={16} />}
            <span>{transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Completed'}</span>
          </div>
        </div>

        <div className="detail-amount">
          <h1 className={transaction.type}>
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </h1>
          <p className="recipient-name">
            {transaction.type === 'income' ? 'From' : 'To'} {transaction.name}
          </p>
        </div>

        <div className="detail-info-grid">
          <div className="info-item">
            <span className="label">Transaction ID</span>
            <span className="value">#TX{transaction.id.toString().padStart(8, '0')}</span>
          </div>
          <div className="info-item">
            <span className="label">Date</span>
            <span className="value">{transaction.date}</span>
          </div>
          <div className="info-item">
            <span className="label">Type</span>
            <span className="value capitalize">{transaction.type}</span>
          </div>
          <div className="info-item">
            <span className="label">Payment Method</span>
            <span className="value">Bro Pay Balance</span>
          </div>
        </div>

        <div className="detail-actions">
          <button className="btn-outline">
            <Download size={18} />
            <span>Download Receipt</span>
          </button>
          <button className="btn-outline">
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
