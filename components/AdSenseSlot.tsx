import React, { useEffect, useRef } from 'react';

export type AdSenseConfig = {
  client: string;
  slot: string;
};

type AdSenseWindow = Window & {
  adsbygoogle?: Record<string, unknown>[];
};

type AdSenseSlotProps = {
  className?: string;
  config?: AdSenseConfig;
};

export const readCalculatorAdSenseConfig = (
  env: Record<string, string | undefined>,
): AdSenseConfig => {
  const client = env.VITE_ADSENSE_CLIENT_ID?.trim() ?? '';
  const slot = env.VITE_ADSENSE_CALCULATOR_SLOT_ID?.trim() ?? '';

  return client && slot ? { client, slot } : { client: '', slot: '' };
};

const loadAdSenseScript = (client: string): Promise<void> => {
  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[data-ta7leel-adsense]',
  );

  if (existingScript) {
    if (existingScript.dataset.loaded === 'true') return Promise.resolve();

    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.ta7leelAdsense = 'true';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener('error', () => reject(), { once: true });
    document.head.appendChild(script);
  });
};

const defaultConfig = readCalculatorAdSenseConfig(
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {},
);

const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  className = '',
  config = defaultConfig,
}) => {
  const requestedRef = useRef(false);
  const adElementRef = useRef<HTMLElement | null>(null);
  const configured = Boolean(config.client && config.slot);

  useEffect(() => {
    if (!configured || requestedRef.current) return;

    requestedRef.current = true;

    loadAdSenseScript(config.client)
      .then(() => {
        if (!adElementRef.current?.isConnected) return;
        const adsenseWindow = window as AdSenseWindow;
        adsenseWindow.adsbygoogle = adsenseWindow.adsbygoogle ?? [];
        adsenseWindow.adsbygoogle.push({});
      })
      .catch(() => {
        requestedRef.current = false;
      });

  }, [config.client, configured]);

  return (
    <aside
      aria-label="Advertisements"
      className={`flex min-h-[280px] w-full flex-col rounded-3xl border border-forest-900/[0.08] bg-white p-4 shadow-card-rest lg:min-h-[520px] ${className}`}
      data-configured={configured}
    >
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-900/45">
        Advertisement
      </p>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-forest-50/45">
        {configured ? (
          <ins
            ref={adElementRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={config.client}
            data-ad-slot={config.slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <span className="text-xs font-medium text-forest-900/30" aria-hidden="true">
            Ad space
          </span>
        )}
      </div>
    </aside>
  );
};

export default AdSenseSlot;
