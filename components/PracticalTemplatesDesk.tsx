import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ClipboardCopy,
  Layers3,
  ListChecks,
  ShieldAlert,
} from 'lucide-react';
import { copyPracticalTemplate, type CopyResult } from './practicalTemplatesModel';

interface PracticalTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  template: string;
  example: string;
  source: string;
  sourcePath: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  iconSurfaceClassName: string;
}

const practicalTemplates: PracticalTemplate[] = [
  {
    id: 'habit-stack',
    title: 'Habit Stack',
    category: 'Build consistency',
    description: 'Attach a new behavior to something you already do without thinking.',
    template: 'After I [current habit],\nI will [new habit].',
    example: 'After I pour my morning coffee, I will read one page.',
    source: 'Atomic Habits',
    sourcePath: '/summary/atomic-habits',
    icon: Layers3,
    iconClassName: 'text-emerald-700',
    iconSurfaceClassName: 'bg-emerald-50 border-emerald-200/80',
  },
  {
    id: 'fear-setting',
    title: 'Fear-Setting',
    category: 'Make the hard decision',
    description: 'Turn a vague fear into risks you can prevent, repair, or accept.',
    template:
      'The worst outcome is [worst outcome].\nI can prevent it by [preventive action].\nThe cost of doing nothing is [cost of inaction].',
    example: 'A small test could fail. I can cap the cost and learn before committing more.',
    source: 'The 4-Hour Workweek',
    sourcePath: '/summary/the-4-hour-workweek',
    icon: ShieldAlert,
    iconClassName: 'text-amber-700',
    iconSurfaceClassName: 'bg-amber-50 border-amber-200/80',
  },
  {
    id: 'pre-mortem',
    title: 'Pre-Mortem',
    category: 'Find risks early',
    description: 'Imagine the plan failed, then work backward before those risks become real.',
    template:
      'Imagine this failed.\nThe likely reasons are [reasons].\nThe earliest warning sign is [warning sign].\nI’ll reduce the risk by [next step].',
    example: 'The launch slipped because scope grew. Freeze the essentials and review weekly.',
    source: 'Be Less Zombie',
    sourcePath: '/summary/be-less-zombie',
    icon: ListChecks,
    iconClassName: 'text-teal-700',
    iconSurfaceClassName: 'bg-teal-50 border-teal-200/80',
  },
];

const PracticalTemplatesDesk: React.FC = () => {
  const [copyState, setCopyState] = useState<Record<string, CopyResult>>({});

  const handleCopy = async (template: PracticalTemplate) => {
    const result = await copyPracticalTemplate(`${template.title}\n\n${template.template}`);
    setCopyState((current) => ({ ...current, [template.id]: result }));
  };

  return (
    <section
      className="border-y border-forest-900/[0.06] bg-white py-16 md:py-24"
      aria-labelledby="practical-templates-title"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] md:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-forest-800/15 bg-forest-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-forest-800">
              <ClipboardCopy className="h-3.5 w-3.5 text-forest-600" />
              Practical Templates
            </p>
            <h2
              id="practical-templates-title"
              className="mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-forest-950 md:text-5xl"
            >
              Don’t just save the idea. Use it.
            </h2>
          </div>
          <div className="md:border-l md:border-forest-900/10 md:pl-7">
            <p className="text-base leading-relaxed text-forest-900/70 md:text-lg">
              Copy a proven framework, personalize the blanks, and put it to work today.
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-forest-700/70">
              Free to use · No account needed
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {practicalTemplates.map((template) => {
            const Icon = template.icon;
            const status = copyState[template.id];

            return (
              <article
                key={template.id}
                className="group flex min-h-full flex-col overflow-hidden rounded-[1.75rem] border border-forest-900/[0.08] bg-[#FBFBFA] shadow-card-rest transition-all duration-300 hover:-translate-y-1 hover:border-forest-700/20 hover:shadow-card-hover"
              >
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-forest-700/70">
                        {template.category}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-extrabold text-forest-950">
                        {template.title}
                      </h3>
                    </div>
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${template.iconSurfaceClassName}`}
                      aria-hidden="true"
                    >
                      <Icon className={`h-5 w-5 ${template.iconClassName}`} />
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-forest-900/65">
                    {template.description}
                  </p>

                  <div className="relative mt-6 overflow-hidden rounded-2xl border border-dashed border-forest-800/20 bg-white px-5 py-5 shadow-[inset_3px_0_0_rgba(20,61,45,0.12)]">
                    <span className="absolute right-4 top-3 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-800/35">
                      Fill the blanks
                    </span>
                    <p className="whitespace-pre-line pt-5 font-serif text-[1.05rem] font-medium leading-8 text-forest-950">
                      {template.template}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl bg-forest-50/80 px-4 py-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-forest-700/70">
                      Example
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-forest-900/75">
                      {template.example}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      to={template.sourcePath}
                      className="group/source inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 transition-colors hover:text-forest-600"
                    >
                      <span>From {template.source}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/source:translate-x-0.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleCopy(template)}
                      aria-label={`Copy ${template.title} template`}
                      className="pressable inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-forest-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-forest-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-forest-700/30"
                    >
                      {status === 'Copied' ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>{status === 'Copied' ? 'Copied' : status === 'Copy failed' ? 'Try again' : 'Copy template'}</span>
                    </button>
                  </div>

                  <span className="sr-only" role="status" aria-live="polite">
                    {status === 'Copied'
                      ? `${template.title} template copied.`
                      : status === 'Copy failed'
                        ? `Could not copy the ${template.title} template. Please try again.`
                        : ''}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PracticalTemplatesDesk;
