import React, { useState, useEffect } from 'react';
import { Users, Plus, Calculator, CheckCircle, Clock, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import '../styles/split-bill.css';

interface SplitBillGroup {
  id: number;
  title: string;
  totalAmount: number;
  date: string;
  status: 'pending' | 'settled';
  participants: { name: string; amount: number; paid: boolean }[];
}

const SplitBill: React.FC = () => {
  const [bills, setBills] = useState<SplitBillGroup[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showNewBill, setShowNewBill] = useState(false);
  const [newBill, setNewBill] = useState({ title: '', amount: '', people: '' });

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await api.splitBills.list();
        if (data.splitBills?.length) {
          setBills(data.splitBills.map((b: any) => ({
            id: b.id,
            title: b.title,
            totalAmount: Number(b.totalAmount || b.total_amount),
            date: b.date || '',
            status: b.status || 'pending',
            participants: b.participants || [],
          })));
        }
      } catch {
        setBills([
          {
            id: 1, title: 'Dinner at Italian Place', totalAmount: 156.50, date: 'Jul 14, 2026', status: 'pending',
            participants: [
              { name: 'You', amount: 52.17, paid: true },
              { name: 'Alex Johnson', amount: 52.17, paid: true },
              { name: 'Sarah Wilson', amount: 52.16, paid: false },
            ]
          },
          {
            id: 2, title: 'Movie Night', totalAmount: 48.00, date: 'Jul 12, 2026', status: 'settled',
            participants: [
              { name: 'You', amount: 16.00, paid: true },
              { name: 'Mike Chen', amount: 16.00, paid: true },
              { name: 'Emily Davis', amount: 16.00, paid: true },
            ]
          },
          {
            id: 3, title: 'Groceries', totalAmount: 89.30, date: 'Jul 10, 2026', status: 'pending',
            participants: [
              { name: 'You', amount: 44.65, paid: true },
              { name: 'Lisa Park', amount: 44.65, paid: false },
            ]
          },
        ]);
      }
    };
    fetchBills();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const createBill = async () => {
    if (newBill.title && newBill.amount && newBill.people) {
      const numPeople = Number(newBill.people) + 1;
      const share = Number(newBill.amount) / numPeople;
      const participants = [
        { name: 'You', amount: share, paid: true },
        ...Array.from({ length: Number(newBill.people) }, (_, i) => ({
          name: `Person ${i + 1}`,
          amount: share,
          paid: false,
        }))
      ];
      const entry = {
        title: newBill.title,
        totalAmount: Number(newBill.amount),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending' as const,
        participants,
      };
      try {
        const data = await api.splitBills.create(entry);
        if (data.splitBill) {
          setBills([{ ...entry, id: data.splitBill.id }, ...bills]);
        }
      } catch {
        setBills([{ ...entry, id: Date.now() }, ...bills]);
      }
      setNewBill({ title: '', amount: '', people: '' });
      setShowNewBill(false);
    }
  };

  const settleBill = async (id: number) => {
    try { await api.splitBills.settle(id); } catch { /* fallback */ }
    setBills(bills.map(b => b.id === id ? { ...b, status: 'settled', participants: b.participants.map(p => ({ ...p, paid: true })) } : b));
  };

  return (
    <div className="split-page">
      <div className="page-header">
        <div>
          <h1>Split Bill</h1>
          <p>Split expenses with friends and keep every payment on track.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewBill(true)}>
          <Plus size={18} />
          New Split
        </button>
      </div>

      <div className="split-stats">
        <div className="stat-card">
          <Calculator size={20} className="stat-icon" />
          <div>
            <span className="stat-label">Total Pending</span>
            <span className="stat-value">${bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.totalAmount, 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={20} className="stat-icon settled" />
          <div>
            <span className="stat-label">Total Settled</span>
            <span className="stat-value">${bills.filter(b => b.status === 'settled').reduce((s, b) => s + b.totalAmount, 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="empty-state">
          <p>No split bills yet. Create one to start sharing costs with friends.</p>
        </div>
      ) : (
        <div className="bills-list">
          {bills.map(bill => (
          <div key={bill.id} className={`bill-card ${bill.status}`}>
            <div className="bill-header" onClick={() => toggleExpand(bill.id)}>
              <div className="bill-info">
                <div className={`bill-status-dot ${bill.status}`}></div>
                <div>
                  <h3>{bill.title}</h3>
                  <span className="bill-date">{bill.date}</span>
                </div>
              </div>
              <div className="bill-right">
                <div className="bill-amount">
                  <span className="amount">${bill.totalAmount.toFixed(2)}</span>
                  <span className="count">{bill.participants.length} people</span>
                </div>
                {expandedId === bill.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedId === bill.id && (
              <div className="bill-details">
                <div className="participants-list">
                  {bill.participants.map((p, i) => (
                    <div key={i} className="participant">
                      <div className="participant-avatar">
                        {p.name === 'You' ? 'Y' : p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="participant-name">{p.name}</span>
                      <span className="participant-amount">${p.amount.toFixed(2)}</span>
                      {p.paid ? (
                        <span className="badge paid">Paid</span>
                      ) : (
                        <span className="badge unpaid">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bill-detail-actions">
                  {bill.status === 'pending' && (
                    <>
                      <button className="btn btn-primary btn-sm">
                        <Send size={14} />
                        Send Reminders
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => settleBill(bill.id)}>
                        <CheckCircle size={14} />
                        Mark Settled
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {showNewBill && (
        <div className="modal-overlay" onClick={() => setShowNewBill(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Split a New Bill</h2>
            <div className="input-group">
              <label>Description</label>
              <input type="text" className="input-field" placeholder="e.g., Dinner" value={newBill.title} onChange={(e) => setNewBill({ ...newBill, title: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Total Amount ($)</label>
              <input type="number" className="input-field" placeholder="0.00" value={newBill.amount} onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Number of People (excluding you)</label>
              <input type="number" className="input-field" placeholder="0" value={newBill.people} onChange={(e) => setNewBill({ ...newBill, people: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowNewBill(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createBill}>Create Split</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitBill;
