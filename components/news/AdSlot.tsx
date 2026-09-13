import React from 'react';

export type AdSenseConfig = {
  client: string;
  slot: string;
};

type AdSlotProps = {
  placement: 'news-index' | 'news-article';
  config?: AdSenseConfig;
};

export const readAdSenseConfig = (
  env: Record<string, string | undefined>,
): AdSenseConfig => (
  env.VITE_ADSENSE_CLIENT_ID && env.VITE_ADSENSE_NEWS_SLOT_ID
    ? {
        client: env.VITE_ADSENSE_CLIENT_ID,
        slot: env.VITE_ADSENSE_NEWS_SLOT_ID,
      }
    : { client: '', slot: '' }
);

const runtimeAdSenseConfig = (): AdSenseConfig => readAdSenseConfig(
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {},
);

export function AdSlot({
  placement,
  config = runtimeAdSenseConfig(),
}: AdSlotProps) {
  const configured = Boolean(config.client && config.slot);

  return (
    <aside
      className={`news-ad news-ad--${placement}`}
      aria-label="Advertisements"
      data-configured={configured}
    >
      <span className="news-ad__label">Advertisements</span>
      <div className="news-ad__space" aria-hidden="true" />
    </aside>
  );
}

