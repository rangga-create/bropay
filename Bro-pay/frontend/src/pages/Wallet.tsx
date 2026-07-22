import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowDownLeft, ArrowUpRight, Send, CreditCard, Wallet as WalletIcon } from 'lucide-react';
import { api } from '../services/api';
import '../styles/wallet.css';

interface WalletData {
  id: string;
  name: string;
  currency: string;
  balance: number;
  color: string;
}

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<WalletData[]>([
    { id: '1', name: 'Main Balance', currency: 'USD', balance: 12450.0, color: 'var(--accent)' },
    { id: '2', name: 'Savings', currency: 'USD', balance: 5420.5, color: 'var(--success)' },
    { id: '3', name: 'Travel Fund', currency: 'EUR', balance: 1200.0, color: 'var(--warning)' }
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeWallet, setActiveWallet] = useState<string>('1');
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWallet, setNewWallet] = useState({ name: '', currency: 'USD', balance: '0' });
  const [formError, setFormError] = useState('');
  const selectedWallet = wallets.find((wallet) => wallet.id === activeWallet) || wallets[0];

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await api.wallets.list();
        if (data.wallets?.length) {
          setWallets(data.wallets.map((wallet: any) => ({
            id: String(wallet.id),
            name: wallet.name,
            currency: wallet.currency,
            balance: Number(wallet.balance),
            color: wallet.color || 'var(--accent)',
          })));
          setActiveWallet(String(data.wallets[0].id));
        }
      } catch (_err) {
        console.error('Failed to fetch wallet data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, []);

  const handleCreateWallet = async () => {
    setFormError('');
    if (!newWallet.name.trim() || !newWallet.currency.trim()) {
      setFormError('Please provide a wallet name and currency.');
      return;
    }
    const balance = Number(newWallet.balance);
    if (isNaN(balance) || balance < 0) {
      setFormError('Starting balance must be a valid number.');
      return;
    }

    try {
      const data = await api.wallets.create({ name: newWallet.name, currency: newWallet.currency, balance });
      const created = data.wallet;
      const wallet: WalletData = {
        id: String(created.id),
        name: created.name,
        currency: created.currency,
        balance: Number(created.balance),
        color: created.color || 'var(--primary)',
      };
      setWallets([wallet, ...wallets]);
      setActiveWallet(wallet.id);
    } catch {
      const wallet: WalletData = {
        id: Date.now().toString(),
        name: newWallet.name,
        currency: newWallet.currency,
        balance,
        color: 'var(--primary)'
      };
      setWallets([wallet, ...wallets]);
      setActiveWallet(wallet.id);
    }
    setShowAddWallet(false);
    setNewWallet({ name: '', currency: 'USD', balance: '0' });
  };

  return (
    <div className="wallet-page">
      <div className="page-header">
        <div>
          <h1>My Wallets</h1>
          <p>Review balances across your accounts and manage funds.</p>
        </div>
        <button className="btn-primary-wallet" onClick={() => setShowAddWallet(true)}>
          <Plus size={18} />
          <span>Add Wallet</span>
        </button>
      </div>

      <div className="wallet-summary">
        <div className="wallet-summary-card">
          <span>Total Balance</span>
          <strong>${wallets.reduce((sum, wallet) => sum + wallet.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="wallet-summary-card small">
          <span>Selected Wallet</span>
          <strong>{selectedWallet?.name}</strong>
        </div>
      </div>

      {loading ? (
        <div className="wallet-cards-grid">
          {[1, 2].map(i => (
            <div key={i} className="wallet-card skeleton-card"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="wallet-cards-grid">
            {wallets.map(wallet => (
              <div 
                key={wallet.id} 
                className={`wallet-card ${activeWallet === wallet.id ? 'active' : ''}`}
                style={{ '--wallet-color': wallet.color } as React.CSSProperties}
                onClick={() => setActiveWallet(wallet.id)}
              >
                <div className="wallet-card-header">
                  <div className="wallet-icon">
                    <WalletIcon size={24} />
                  </div>
                  <span className="wallet-currency">{wallet.currency}</span>
                </div>
                <div className="wallet-card-body">
                  <p className="wallet-label">{wallet.name}</p>
                  <h2 className="wallet-balance">
                    ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h2>
                </div>
                <div className="wallet-card-footer">
                  <span className="wallet-type">Digital Account</span>
                  <div className="wallet-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="wallet-actions">
            <button className="action-btn" onClick={() => navigate('/transfer')}>
              <div className="action-icon income"><ArrowDownLeft size={24} /></div>
              <span>Top Up</span>
            </button>
            <button className="action-btn">
              <div className="action-icon expense"><ArrowUpRight size={24} /></div>
              <span>Withdraw</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/transfer')}>
              <div className="action-icon transfer"><Send size={24} /></div>
              <span>Transfer</span>
            </button>
            <button className="action-btn">
              <div className="action-icon card"><CreditCard size={24} /></div>
              <span>Card</span>
            </button>
          </div>
        </>
      )}

      {showAddWallet && (
        <div className="modal-overlay" onClick={() => setShowAddWallet(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Wallet</h2>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Emergency Fund"
                value={newWallet.name}
                onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Currency</label>
              <select
                className="input-field"
                value={newWallet.currency}
                onChange={(e) => setNewWallet({ ...newWallet, currency: e.target.value })}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="input-group">
              <label>Starting Balance</label>
              <input
                type="number"
                className="input-field"
                placeholder="0.00"
                value={newWallet.balance}
                onChange={(e) => setNewWallet({ ...newWallet, balance: e.target.value })}
              />
            </div>
            {formError && <p className="form-error">{formError}</p>}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddWallet(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateWallet}>Create Wallet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
