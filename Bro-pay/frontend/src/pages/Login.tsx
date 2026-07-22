import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Wallet } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { api } from '../services/api';
import '../styles/auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const token = await credentials.user.getIdToken();
      const data = await api.auth.login({ idToken: token });

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Cannot connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="logo-icon-large">BP</div>
            <span>Bro Pay</span>
          </div>
          <h1>The future of <br/><span className="highlight">digital payments</span></h1>
          <p>Send, receive, and manage your money with confidence. Experience the next generation of financial technology.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Instant Transfers</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Bank-Level Security</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Smart Analytics</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-container">
        <div className="auth-form-card">
          <div className="mobile-logo">
            <div className="logo-icon">BP</div>
            <span>Bro Pay</span>
          </div>
          
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          <button className="google-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">
            <span>or continue with email</span>
          </div>

          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="icon" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
              <div className="input-icon-wrapper">
                <Lock size={18} className="icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <span className="checkmark"></span>
                <span className="label-text">Remember me for 30 days</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
