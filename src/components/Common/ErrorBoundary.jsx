import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px', maxWidth: '700px', margin: '60px auto',
          background: '#fff1f1', border: '1px solid #fca5a5', borderRadius: '16px',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>⚠️ Something went wrong</h2>
          <p style={{ color: '#7f1d1d', fontFamily: 'sans-serif' }}>
            The app crashed with the following error. Please copy this and share it:
          </p>
          <pre style={{
            background: '#1e1e1e', color: '#f87171', padding: '16px',
            borderRadius: '8px', overflowX: 'auto', fontSize: '0.82rem',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all'
          }}>
            {this.state.error?.toString()}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px', padding: '10px 20px', background: '#dc2626',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem'
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
