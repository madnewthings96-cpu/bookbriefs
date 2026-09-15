import React, { useEffect, useRef } from 'react';

export type AdSenseConfig = {
  client: string;
  slot: string;
};

type AdSlotProps = {
  placement: 'news-index' | 'news-article';
  config?: AdSenseConfig;
};

export type AdSenseDocument = {
  documentElement: {
    dataset: Record<string, string | undefined>;
  };
  createElement: (tagName: 'script') => HTMLScriptElement;
  head: {
    appendChild: (script: HTMLScriptElement) => unknown;
  };
};

type AdSenseQueue = {
  push: (request: Record<string, never>) => unknown;
};

export type AdSenseQueueHost = {
  adsbygoogle?: AdSenseQueue;
};

const scriptLoads = new WeakMap<AdSenseDocument, Promise<boolean>>();
const SCRIPT_LOADED_MARKER = 'adsenseLoaded';

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

const runtimeDocument = (): AdSenseDocument | undefined => (
  typeof document === 'undefined'
    ? undefined
    : document as unknown as AdSenseDocument
);

const runtimeQueueHost = (): AdSenseQueueHost | undefined => (
  typeof window === 'undefined'
    ? undefined
    : window as unknown as AdSenseQueueHost
);

export const loadAdSenseScript = (
  client: string,
  targetDocument: AdSenseDocument,
): Promise<boolean> => {
  if (targetDocument.documentElement.dataset[SCRIPT_LOADED_MARKER] === 'true') {
    return Promise.resolve(true);
  }

  const pendingLoad = scriptLoads.get(targetDocument);
  if (pendingLoad) return pendingLoad;

  const load = new Promise<boolean>((resolve) => {
    try {
      const script = targetDocument.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
      script.onload = () => {
        targetDocument.documentElement.dataset[SCRIPT_LOADED_MARKER] = 'true';
        resolve(true);
      };
      script.onerror = () => resolve(false);
      targetDocument.head.appendChild(script);
    } catch {
      resolve(false);
    }
  });

  scriptLoads.set(targetDocument, load);
  return load;
};

export const requestAdSenseAd = async (
  config: AdSenseConfig,
  targetDocument = runtimeDocument(),
  queueHost = runtimeQueueHost(),
  shouldRequest: () => boolean = () => true,
): Promise<boolean> => {
  if (!config.client || !config.slot || !targetDocument || !queueHost) return false;

  try {
    const loaded = await loadAdSenseScript(config.client, targetDocument);
    if (!loaded || !shouldRequest()) return false;

    const queue = queueHost.adsbygoogle ?? [];
    queueHost.adsbygoogle = queue;
    queue.push({});
    return true;
  } catch {
    return false;
  }
};

export function AdSlot({
  placement,
  config = runtimeAdSenseConfig(),
}: AdSlotProps) {
  const configured = Boolean(config.client && config.slot);
  const requested = useRef(false);

  useEffect(() => {
    if (!configured || requested.current) return undefined;

    let mounted = true;
    void requestAdSenseAd(
      config,
      runtimeDocument(),
      runtimeQueueHost(),
      () => mounted && !requested.current,
    ).then((didRequest) => {
      if (didRequest) requested.current = true;
    }).catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [config.client, config.slot, configured]);

  return (
    <aside
      className={`news-ad news-ad--${placement}`}
      aria-label="Advertisements"
      data-configured={configured}
    >
      <div className="news-ad__sticky">
        <span className="news-ad__label">Advertisements</span>
        {configured ? (
          <ins
            className="adsbygoogle"
            data-ad-client={config.client}
            data-ad-slot={config.slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="news-ad__space" aria-hidden="true" />
        )}
      </div>
    </aside>
  );
}
