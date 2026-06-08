import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { BookDefinition } from './types.js';

export async function loadBookCatalog(): Promise<BookDefinition[]> {
  const libraryDir = path.join(process.cwd(), 'scripts', 'library');
  const files = (await readdir(libraryDir))
    .filter((file) => file.endsWith('.ts'))
    .sort((a, b) => a.localeCompare(b));

  const books: BookDefinition[] = [];

  for (const file of files) {
    const modulePath = path.join(libraryDir, file);
    const moduleUrl = pathToFileURL(modulePath).href;
    const mod = await import(moduleUrl);

    if (mod.book?.id) {
      books.push(mod.book as BookDefinition);
    }
  }

  const seen = new Set<string>();
  return books
    .filter((book) => {
      if (seen.has(book.id)) return false;
      seen.add(book.id);
      return true;
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getCanonicalBookSlug(book: BookDefinition): string {
  return book.arabicSlug || book.id;
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 80 ? lastSpace : truncated.length).trim()}...`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(value: string): string {
  return escapeHtml(value);
}

export function absoluteUrl(siteUrl: string, pathname: string): string {
  return encodeURI(`${siteUrl}${pathname}`);
}

export function getArabicTitle(book: BookDefinition): string {
  if (book.arabicSlug && /[\u0600-\u06FF]/.test(book.arabicSlug)) {
    return book.arabicSlug.replace(/-/g, ' ');
  }

  return book.title;
}

