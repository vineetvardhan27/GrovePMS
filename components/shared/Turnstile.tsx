'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface TurnstileRef {
  reset: () => void;
  reload: () => void;
}

interface TurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onError?: (errorCode?: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (code?: string) => void;
          'expired-callback'?: () => void;
          theme?: string;
          size?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
  {
    siteKey,
    onVerify,
    onError,
    onExpire,
    theme = 'light',
    size = 'normal',
    className = '',
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read strictly from prop or .env (NEXT_PUBLIC_TURNSTILE_SITE_KEY) - no hard-coded fallback
  const effectiveSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  const renderWidget = React.useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;

    if (!effectiveSiteKey) {
      console.warn('[Turnstile] Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY in environment variables.');
      onError?.('SITEKEY_MISSING');
      return;
    }

    // Safely remove existing widget if already mounted
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (e) {
        // ignore removal error
      }
      widgetIdRef.current = null;
    }

    // Clean container innerHTML to prevent duplicate iframes or leftover error states
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: effectiveSiteKey,
        callback: (token: string) => {
          setIsLoaded(true);
          onVerify(token);
        },
        'error-callback': (code?: string) => {
          setIsLoaded(true);
          console.warn('[Turnstile] Cloudflare challenge reported error code:', code);
          onError?.(code || 'CHALLENGE_FAILED');
        },
        'expired-callback': () => {
          onExpire?.();
        },
        theme,
        size,
      });

      widgetIdRef.current = id;
      setIsLoaded(true);
    } catch (err) {
      console.error('[Turnstile] Render error:', err);
      onError?.('RENDER_EXCEPTION');
    }
  }, [effectiveSiteKey, onVerify, onError, onExpire, theme, size]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
          return;
        } catch (e) {
          console.warn('[Turnstile] Fast reset failed, performing clean reload:', e);
        }
      }
      renderWidget();
    },
    reload: () => {
      renderWidget();
    },
  }), [renderWidget]);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const setupWidget = () => {
      if (!isMounted) return;

      if (window.turnstile) {
        renderWidget();
      } else {
        const existingScript = document.getElementById('cloudflare-turnstile-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'cloudflare-turnstile-script';
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (isMounted) renderWidget();
          };
          script.onerror = () => {
            if (isMounted) {
              console.error('[Turnstile] Script failed to load (possible ad blocker or network block).');
              onError?.('SCRIPT_LOAD_FAILED');
            }
          };
          document.head.appendChild(script);
        } else {
          // Poll briefly until window.turnstile is defined
          let pollCount = 0;
          const interval = setInterval(() => {
            pollCount++;
            if (window.turnstile) {
              clearInterval(interval);
              if (isMounted) renderWidget();
            } else if (pollCount > 50) {
              // 5-second timeout
              clearInterval(interval);
              if (isMounted) {
                console.error('[Turnstile] Script initialization timed out.');
                onError?.('SCRIPT_LOAD_TIMEOUT');
              }
            }
          }, 100);

          return () => clearInterval(interval);
        }
      }
    };

    // Small delay (50ms) to allow React 18 StrictMode unmount-remount to settle
    timer = setTimeout(setupWidget, 50);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          // Ignore removal errors on component unmount
        }
      }
    };
  }, [renderWidget, onError]);

  if (!effectiveSiteKey) {
    return (
      <div className={`turnstile-wrapper my-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 ${className}`}>
        <p className="font-semibold flex items-center gap-1.5">
          <span>Turnstile Site Key Not Found</span>
        </p>
        <p className="mt-1 text-ink-muted">
          Please set <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> in your <code className="font-mono">.env.local</code> file.
        </p>
      </div>
    );
  }

  return (
    <div className={`turnstile-wrapper my-2 ${className}`}>
      <div
        id="turnstile-widget"
        ref={containerRef}
        aria-label="Cloudflare Turnstile Security Verification"
        className="min-h-[65px] flex items-center"
      />
      {!isLoaded && (
        <div className="flex items-center gap-2 text-xs text-ink-muted/70 py-2">
          <ShieldCheck className="w-4 h-4 text-brand-forest/60 animate-pulse" />
          <span>Loading secure verification...</span>
        </div>
      )}
    </div>
  );
});

Turnstile.displayName = 'Turnstile';
