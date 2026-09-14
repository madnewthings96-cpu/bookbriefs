import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { collection, getDocs, getFirestore, orderBy, query, where } from 'firebase/firestore';
import {
  NEWS_CATEGORIES,
  type NewsArticle,
  type NewsCategory,
  type NewsSource,
} from '../components/news/newsModel.ts';

const BUILD_APP_NAME = 'ta7leel-news-catalog-build';
const REQUIRED_FIREBASE_VARIABLES = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

type BuildEnvironment = Record<string, string | undefined>;

export interface NewsCatalogDocument {
  id: string;
  data: unknown;
}

export interface NewsCatalogLoadOptions {
  environment?: BuildEnvironment;
  warn?: (message: string) => void;
}

let didWarnAboutUnavailableCatalog = false;

const asDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value.getTime());
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
};

const isNewsCategory = (value: unknown): value is NewsCategory => (
  typeof value === 'string' && (NEWS_CATEGORIES as readonly string[]).includes(value)
);

const isNewsSource = (value: unknown): value is NewsSource => (
  !!value
  && typeof value === 'object'
  && typeof (value as NewsSource).label === 'string'
  && typeof (value as NewsSource).url === 'string'
);

function normalizePublishedNewsDocument(document: NewsCatalogDocument): NewsArticle | null {
  if (!document.id || !document.data || typeof document.data !== 'object') return null;
  const data = document.data as Record<string, unknown>;
  if (
    data.status !== 'published'
    || data.language !== 'en'
    || typeof data.title !== 'string'
    || typeof data.slug !== 'string'
    || typeof data.excerpt !== 'string'
    || typeof data.body !== 'string'
    || !isNewsCategory(data.category)
    || typeof data.authorName !== 'string'
    || typeof data.imageUrl !== 'string'
    || typeof data.imagePath !== 'string'
    || typeof data.imageAlt !== 'string'
    || !Array.isArray(data.sources)
    || !data.sources.every(isNewsSource)
  ) return null;

  const createdAt = asDate(data.createdAt);
  const updatedAt = asDate(data.updatedAt);
  const publishedAt = asDate(data.publishedAt);
  if (!createdAt || !updatedAt || !publishedAt) return null;

  return {
    id: document.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    body: data.body,
    category: data.category,
    language: 'en',
    authorName: data.authorName,
    imageUrl: data.imageUrl,
    imagePath: data.imagePath,
    imageAlt: data.imageAlt,
    sources: data.sources.map((source) => ({ label: source.label, url: source.url })),
    status: 'published',
    createdAt,
    updatedAt,
    publishedAt,
  };
}

export function normalizePublishedNewsDocuments(documents: NewsCatalogDocument[]): NewsArticle[] {
  return documents
    .map(normalizePublishedNewsDocument)
    .filter((article): article is NewsArticle => article !== null)
    .sort((left, right) => {
      const dateDifference = right.publishedAt.getTime() - left.publishedAt.getTime();
      return dateDifference || right.id.localeCompare(left.id);
    });
}

function firebaseConfigFromEnvironment(environment: BuildEnvironment): FirebaseOptions {
  const missing = REQUIRED_FIREBASE_VARIABLES.filter((name) => !environment[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing ${REQUIRED_FIREBASE_VARIABLES.join(', ')}. Set the VITE_FIREBASE_* build variables to publish static news SEO.`,
    );
  }

  return {
    apiKey: environment.VITE_FIREBASE_API_KEY,
    authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: environment.VITE_FIREBASE_PROJECT_ID,
    storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: environment.VITE_FIREBASE_APP_ID,
    measurementId: environment.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

function handleCatalogFailure(
  error: unknown,
  environment: BuildEnvironment,
  warn: (message: string) => void,
): NewsArticle[] {
  const detail = error instanceof Error ? error.message : String(error);
  const message = `News catalog unavailable during the build: ${detail}`;
  if (environment.NEWS_CATALOG_REQUIRED === 'true') {
    throw new Error(`${message} Set NEWS_CATALOG_REQUIRED=false only for builds that may omit static news routes.`, {
      cause: error,
    });
  }
  if (!didWarnAboutUnavailableCatalog) {
    didWarnAboutUnavailableCatalog = true;
    warn(`${message} Continuing with the crawlable /news fallback and no static article routes.`);
  }
  return [];
}

export async function loadPublishedNewsCatalog(
  options: NewsCatalogLoadOptions = {},
): Promise<NewsArticle[]> {
  const environment = options.environment ?? process.env;
  const warn = options.warn ?? console.warn;
  try {
    const firebaseConfig = firebaseConfigFromEnvironment(environment);
    const app = getApps().some((candidate) => candidate.name === BUILD_APP_NAME)
      ? getApp(BUILD_APP_NAME)
      : initializeApp(firebaseConfig, BUILD_APP_NAME);
    const database = getFirestore(app);
    const snapshot = await getDocs(query(
      collection(database, 'newsArticles'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
    ));
    return normalizePublishedNewsDocuments(
      snapshot.docs.map((entry) => ({ id: entry.id, data: entry.data() })),
    );
  } catch (error) {
    return handleCatalogFailure(error, environment, warn);
  }
}
