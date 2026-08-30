import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Register the service worker so the app becomes installable
    // (Chrome/Android "Add to Home Screen" / desktop install prompt).
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('Service worker registration failed:', err));
    }
  }, []);

  return <Component {...pageProps} />;
}
