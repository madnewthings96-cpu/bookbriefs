import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Flame,
  Heart,
  Library,
  Play,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ReadingStat, ReadingStatKey } from './profilePageModel';

interface HeroBook {
  title: string;
  author: string;
  coverImageUrl: string;
  progress: number;
}

interface ProfileHeroProps {
  greeting: string;
  userName: string;
  isNewReader: boolean;
  hasProgress: boolean;
  nextBook?: HeroBook;
  stats: ReadingStat[];
  onPrimaryAction: () => void;
  onBrowse: () => void;
}

const STAT_ICONS: Record<ReadingStatKey, LucideIcon> = {
  completed: Trophy,
  streak: Flame,
  time: Clock3,
  saved: Heart,
};

const ProfileHero: React.FC<ProfileHeroProps> = ({
  greeting,
  userName,
  isNewReader,
  hasProgress,
  nextBook,
  stats,
  onPrimaryAction,
  onBrowse,
}) => {
  const progress = Math.min(100, Math.max(0, nextBook?.progress ?? 0));
  const primaryVerb = hasProgress ? 'Continue' : 'Start';

  return (
    <section className="reader-hero" aria-labelledby="reading-desk-title">
      <div className="reader-hero__atmosphere" aria-hidden="true" />
      <div className="reader-hero__copy">
        <p className="reader-kicker"><BookOpen size={16} aria-hidden="true" /> Reader&apos;s field desk</p>
        <h1 id="reading-desk-title">{greeting}, <span>{userName}.</span></h1>
        <p className="reader-hero__dek">
          {isNewReader
            ? 'Choose one useful idea today. Your reading history will grow from there.'
            : 'Return to the ideas you are carrying forward and keep your reading rhythm alive.'}
        </p>
        <div className="reader-hero__actions">
          <button
            type="button"
            className="reader-action reader-action--primary"
            aria-label={nextBook ? `${primaryVerb} ${nextBook.title}` : 'Start a summary'}
            disabled={!nextBook}
            onClick={onPrimaryAction}
          >
            <Play size={16} aria-hidden="true" />
            {hasProgress ? 'Continue reading' : 'Start a summary'}
          </button>
          <button type="button" className="reader-action reader-action--quiet" onClick={onBrowse}>
            <Library size={16} aria-hidden="true" /> Browse library
          </button>
        </div>
      </div>

      <aside className="next-read" aria-label="Next on your reading desk">
        <div className="next-read__label"><Sparkles size={15} aria-hidden="true" /> Next on your desk</div>
        {nextBook ? (
          <div className="next-read__book">
            <img src={nextBook.coverImageUrl} alt="" />
            <div className="next-read__details">
              <p>{progress > 0 ? `${progress}% read` : 'A fresh start'}</p>
              <h2>{nextBook.title}</h2>
              <span>{nextBook.author}</span>
              <div
                className="next-read__progress"
                role="progressbar"
                aria-label={`${nextBook.title} reading progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
              <button type="button" aria-label={`${primaryVerb} ${nextBook.title}`} onClick={onPrimaryAction}>
                {primaryVerb} <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <p className="next-read__loading" role="status">Preparing your first recommendation…</p>
        )}
      </aside>

      {isNewReader ? (
        <div className="reader-onboarding" role="note">
          <div>
            <span>New trail</span>
            <h2>Your reading trail starts here</h2>
          </div>
          <ol>
            <li><b>01</b><span>Choose one summary</span></li>
            <li><b>02</b><span>Keep one useful idea</span></li>
            <li><b>03</b><span>Return tomorrow</span></li>
          </ol>
        </div>
      ) : (
        <dl className="reader-ledger" aria-label="Reading activity">
          {stats.map((stat) => {
            const Icon = STAT_ICONS[stat.key];
            return (
              <div key={stat.key}>
                <span className="reader-ledger__icon"><Icon size={16} aria-hidden="true" /></span>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
                <small>{stat.helper}</small>
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
};

export default ProfileHero;
