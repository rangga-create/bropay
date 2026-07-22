import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { api } from '../services/api';
import '../styles/auth.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLevel = getPasswordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'var(--danger)', 'var(--warning)', '#2563EB', 'var(--success)'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await api.auth.register({ name, email, password });
      if (data.success) {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        const token = await credentials.user.getIdToken();
        const loginResponse = await api.auth.login({ idToken: token });
        if (loginResponse.success) {
          localStorage.setItem('user', JSON.stringify(loginResponse.user));
          localStorage.setItem('token', token);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Cannot connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="logo-icon-large">BP</div>
            <span>Bro Pay</span>
          </div>
          <h1>Start your <br/><span className="highlight">financial journey</span></h1>
          <p>Join millions of users who trust Bro Pay for their daily financial needs.</p>
          
          <div className="testimonial-card">
            <p>"Bro Pay has completely changed how I manage my money. The analytics are incredible!"</p>
            <div className="testimonial-author">
              <div className="author-avatar">JD</div>
              <div>
                <strong>Jane Doe</strong>
                <span>Premium Member</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
      </div>

      <div className="auth-form-container">
        <div className="auth-form-card">
          <div className="mobile-logo">
            <div className="logo-icon">BP</div>
            <span>Bro Pay</span>
          </div>
          
          <div className="form-header">
            <h2>Create an account</h2>
            <p>Enter your details to get started</p>
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

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-icon-wrapper">
                <User size={18} className="icon" />
                <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="icon" />
                <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="icon" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`bar ${strengthLevel >= i ? 'active' : ''}`} style={{ backgroundColor: strengthLevel >= i ? strengthColors[strengthLevel] : 'var(--border-color)' }}></div>
                    ))}
                  </div>
                  <span style={{ color: strengthColors[strengthLevel] }}>{strengthLabels[strengthLevel]}</span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="icon" />
                <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" required />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                <span className="checkmark"></span>
                <span className="label-text">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
