'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #312e81, #7e22ce, #be185d)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <span style={{ fontSize: '2.5rem' }}>⚠️</span>
            </div>

            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Critical Error
            </h2>

            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '0.5rem'
            }}>
              {error.message || 'A critical error occurred'}
            </p>

            {error.digest && (
              <p style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                marginBottom: '1.5rem'
              }}>
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              style={{
                background: 'linear-gradient(to right, #14b8a6, #a855f7)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                marginTop: '1rem'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
