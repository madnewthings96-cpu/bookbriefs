import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function DashboardNotFoundPage() {
  useSEO({
    title: 'Dashboard page not found | Ta7leel',
    description: 'The requested private dashboard page could not be found.',
    noindex: true,
  });

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Private workspace</p>
      <h1 className="mt-3 text-3xl font-bold text-gray-900">Dashboard page not found</h1>
      <p className="mt-3 max-w-md text-gray-600">That dashboard destination does not exist or may have moved.</p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-5 font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        Return to dashboard
      </Link>
    </section>
  );
}
