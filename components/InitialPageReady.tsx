import { useEffect } from 'react';

/** Commits only after the initial route's Suspense boundary resolves. */
export default function InitialPageReady() {
  useEffect(() => {
    window.dispatchEvent(new Event('ta7leel:page-ready'));
  }, []);
  return null;
}
