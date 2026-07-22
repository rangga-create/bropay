import React, { useState } from 'react';
import { Sun, Moon, Bell, Globe, Lock, Monitor, ChevronRight, Check, LogOut, Trash2, Shield, CreditCard, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import '../styles/settings.css';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    transactions: true,
    marketing: false,
  });
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    const currentTheme = theme;
    if (newTheme !== currentTheme) {
      toggleTheme();
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCurrencyChange = (c: string) => {
    setCurrency(c);
    localStorage.setItem('currency', c);
    setShowCurrencyPicker(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your preferences and account settings</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="settings-card">
            <div className="theme-options">
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <Sun size={20} />
                <span>Light</span>
                {theme === 'light' && <div className="check-icon"><Check size={14} /></div>}
              </button>
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon size={20} />
                <span>Dark</span>
                {theme === 'dark' && <div className="check-icon"><Check size={14} /></div>}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="item-info">
                <Bell size={20} />
                <div>
                  <h4>Push Notifications</h4>
                  <p>Receive push notifications on your devices</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.push} onChange={() => toggleNotification('push')} />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <Bell size={20} />
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive email updates about your account</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.email} onChange={() => toggleNotification('email')} />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <Bell size={20} />
                <div>
                  <h4>Transaction Alerts</h4>
                  <p>Get notified for every transaction</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.transactions} onChange={() => toggleNotification('transactions')} />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <Bell size={20} />
                <div>
                  <h4>Marketing</h4>
                  <p>Receive tips, tricks, and product updates</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.marketing} onChange={() => toggleNotification('marketing')} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>General</h3>
          <div className="settings-card list-card">
            <button className="list-item" onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}>
              <div className="item-info">
                <CreditCard size={20} />
                <div>
                  <h4>Currency</h4>
                  <p>{currency}</p>
                </div>
              </div>
              <ChevronRight size={20} className="chevron" />
            </button>
            {showCurrencyPicker && (
              <div className="currency-picker">
                {['USD', 'EUR', 'GBP', 'IDR', 'JPY', 'SGD'].map(c => (
                  <button key={c} className={`currency-option ${currency === c ? 'active' : ''}`} onClick={() => handleCurrencyChange(c)}>
                    {c}
                    {currency === c && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
            <button className="list-item" onClick={() => navigate('/profile')}>
              <div className="item-info">
                <Globe size={20} />
                <div>
                  <h4>Profile</h4>
                  <p>Edit your personal information</p>
                </div>
              </div>
              <ChevronRight size={20} className="chevron" />
            </button>
            <button className="list-item">
              <div className="item-info">
                <Lock size={20} />
                <div>
                  <h4>Privacy & Security</h4>
                  <p>Manage your privacy settings</p>
                </div>
              </div>
              <ChevronRight size={20} className="chevron" />
            </button>
            <button className="list-item" onClick={() => navigate('/help')}>
              <div className="item-info">
                <HelpCircle size={20} />
                <div>
                  <h4>Help & Support</h4>
                  <p>Get help with your account</p>
                </div>
              </div>
              <ChevronRight size={20} className="chevron" />
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Account</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="item-info">
                <LogOut size={20} style={{ color: 'var(--danger)' }} />
                <div>
                  <h4 style={{ color: 'var(--danger)' }}>Log Out</h4>
                  <p>Sign out of your account</p>
                </div>
              </div>
              <button className="btn-text" style={{ color: 'var(--danger)' }} onClick={handleLogout}>Log Out</button>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <Trash2 size={20} style={{ color: 'var(--danger)' }} />
                <div>
                  <h4 style={{ color: 'var(--danger)' }}>Delete Account</h4>
                  <p>Permanently delete your account and data</p>
                </div>
              </div>
              <button className="btn-text" style={{ color: 'var(--danger)' }}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
