import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

export default function NotFoundPage() {
  useSEO({ title: 'Page not found | Ta7leel', description: 'Find book summaries and articles in the Ta7leel library.', noindex: true });
  return <section className="mx-auto max-w-3xl px-4 py-16 text-center">
    <h1 className="text-3xl font-bold">Page not found / الصفحة غير موجودة</h1>
    <p className="my-6">Browse the library to find your next read.</p>
    <Link className="text-orange-700 underline" to="/summaries/">Book summaries / ملخصات الكتب</Link>
  </section>;
}
