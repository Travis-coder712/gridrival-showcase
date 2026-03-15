import { useState, useEffect } from 'react';

declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;

const POLL_INTERVAL = 5 * 60 * 1000; // check every 5 minutes

export default function VersionBadge() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    async function checkForUpdate() {
      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.version && data.version !== __APP_VERSION__) {
          setUpdateAvailable(true);
        }
      } catch {
        // silently ignore — offline or network error
      }
    }

    // initial check after 10s, then every 5min
    const initial = setTimeout(() => {
      checkForUpdate();
      timer = setInterval(checkForUpdate, POLL_INTERVAL);
    }, 10_000);

    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      {/* Version badge — bottom-right corner */}
      <div
        style={{
          position: 'fixed',
          bottom: 8,
          right: 12,
          zIndex: 9999,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 10,
          color: 'rgba(148,163,184,0.6)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        v{__APP_VERSION__}
      </div>

      {/* Update toast */}
      {updateAvailable && !dismissed && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: 'rgba(30, 58, 95, 0.95)',
            border: '1px solid rgba(71, 167, 255, 0.4)',
            borderRadius: 12,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: 13, color: '#93c5fd' }}>
            Update available
          </span>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(71,167,255,0.2)',
              border: '1px solid rgba(71,167,255,0.4)',
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 12,
              color: '#60a5fa',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(148,163,184,0.6)',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
