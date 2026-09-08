import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export function AuthOverlay() {
  const {
    currentUser,
    isUnlocked,
    authStage,
    setAuthStage,
    authMode,
    setAuthMode,
    authError,
    setAuthError,
    signIn,
    signUp,
    verifyMpin,
    saveMpin,
    unlockGuest
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mpin, setMpin] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [backgroundBase64, setBackgroundBase64] = useState('');
  const [loading, setLoading] = useState(false);

  if (isUnlocked) return null;

  const handleFileUpload = (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authStage === 'credentials') {
        if (authMode === 'signin') {
          await signIn(email, password);
        } else {
          await signUp(email, password, logoBase64, backgroundBase64);
        }
      } else if (authStage === 'setup') {
        if (mpin.length < 4 || mpin.length > 6) {
          setAuthError('MPIN must be 4 to 6 digits.');
          setLoading(false);
          return;
        }
        await saveMpin(mpin);
      } else if (authStage === 'mpin') {
        await verifyMpin(mpin);
      }
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-panel">
        <div className="brand-mark" id="authBrandMark">
          LR
        </div>
        <h2>Arun Clinical Lab</h2>
        <p className="auth-kicker">Secure laboratory workspace</p>

        <p className="muted-text">
          {authStage === 'credentials' && (authMode === 'signin' ? 'Sign in to access your reports and records.' : 'Register a new lab account.')}
          {authStage === 'setup' && 'Create a 4 to 6 digit MPIN for quick access.'}
          {authStage === 'mpin' && `Enter your MPIN to continue as ${currentUser?.email || 'authenticated user'}.`}
        </p>

        <form onSubmit={handleSubmit}>
          {authStage === 'credentials' && (
            <>
              <div className="field-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lab@example.com"
                  required
                />
              </div>
              <div className="field-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              {authMode === 'signup' && (
                <div className="auth-media-group">
                  <label className="background-upload">
                    <span>Lab Logo</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setLogoBase64)} />
                    <small>{logoBase64 ? 'Logo selected' : 'Optional PNG/JPG'}</small>
                  </label>
                  <label className="background-upload">
                    <span>Login Background</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setBackgroundBase64)} />
                    <small>{backgroundBase64 ? 'Image selected' : 'Branding banner'}</small>
                  </label>
                </div>
              )}
            </>
          )}

          {(authStage === 'setup' || authStage === 'mpin') && (
            <div className="field-group">
              <label>{authStage === 'setup' ? 'Create MPIN (4-6 digits)' : 'Enter MPIN'}</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4,6}"
                maxLength={6}
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                autoFocus
                required
              />
            </div>
          )}

          <button className="primary-btn auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : authStage === 'credentials' ? (authMode === 'signin' ? 'Sign In' : 'Sign Up') : authStage === 'setup' ? 'Save MPIN & Enter' : 'Unlock Workspace'}
          </button>
        </form>

        {authStage === 'credentials' && (
          <button
            className="ghost-btn auth-toggle"
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
              setAuthError('');
            }}
          >
            {authMode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        )}

        {authStage === 'mpin' && (
          <button
            className="ghost-btn auth-toggle"
            type="button"
            onClick={() => setAuthStage('credentials')}
          >
            Switch Account / Sign In with Password
          </button>
        )}

        <div style={{ marginTop: '14px', textAlign: 'center' }}>
          <button
            className="ghost-btn"
            style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
            type="button"
            onClick={unlockGuest}
          >
            Continue as Guest (Offline Mode)
          </button>
        </div>

        {authError && (
          <p className="auth-error" role="alert">
            {authError}
          </p>
        )}
      </div>
    </div>
  );
}
