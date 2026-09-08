export type DownloadResourceKind = 'pdf' | 'notion' | 'template' | 'guide' | 'tool';

export interface DownloadResource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  kind: DownloadResourceKind;
  format: string;
  category: string;
  updatedAt: string;
  featured?: boolean;
}

export interface DownloadResourceFilter {
  kind: 'all' | DownloadResourceKind;
  query: string;
}

export const DOWNLOAD_RESOURCE_KINDS: ReadonlyArray<{
  value: DownloadResourceFilter['kind'];
  label: string;
}> = [
  { value: 'all', label: 'All resources' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'notion', label: 'Notion' },
  { value: 'template', label: 'Templates' },
  { value: 'guide', label: 'Guides' },
  { value: 'tool', label: 'Tools' },
];

export const DOWNLOAD_RESOURCES: DownloadResource[] = [
  {
    id: 'ta7leel-trading-journal-standard',
    title: 'Ta7leel Trading Journal — Standard',
    description:
      'A practical Notion workspace for logging trades, reviewing decisions, and turning market experience into a repeatable process.',
    fileUrl:
      'https://www.notion.so/Ta7leel-site-Trading-Journal-Standard-2905d80c6175803e9f67c375e834c0a6',
    kind: 'notion',
    format: 'Notion template',
    category: 'Trading',
    updatedAt: '2024-01-15',
    featured: true,
  },
];

export const filterDownloadResources = (
  resources: readonly DownloadResource[],
  filter: DownloadResourceFilter,
): DownloadResource[] => {
  const query = filter.query.trim().toLocaleLowerCase();

  return resources.filter((resource) => {
    const matchesKind = filter.kind === 'all' || resource.kind === filter.kind;
    const searchable = `${resource.title} ${resource.description} ${resource.category} ${resource.format}`
      .toLocaleLowerCase();
    return matchesKind && (query.length === 0 || searchable.includes(query));
  });
};

export const getDownloadAction = (resource: DownloadResource) => {
  const external = /^https?:\/\//i.test(resource.fileUrl);
  const label = resource.kind === 'notion'
    ? 'Open in Notion'
    : resource.kind === 'pdf'
      ? 'Download PDF'
      : resource.kind === 'tool'
        ? 'Open tool'
        : 'Get template';

  return {
    label,
    external,
    downloadName: external ? undefined : resource.title,
  };
};

export const formatResourceDate = (dateKey: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return 'Recently updated';

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return 'Recently updated';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};
