import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Coffee,
  Download,
  FileText,
  FolderArchive,
  LayoutTemplate,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  DOWNLOAD_RESOURCE_KINDS,
  DownloadResource,
  DownloadResourceKind,
  filterDownloadResources,
  formatResourceDate,
  getDownloadAction,
} from './downloadsModel';

interface DownloadsLibraryProps {
  resources: readonly DownloadResource[];
}

const resourceIcons: Record<DownloadResourceKind, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  pdf: FileText,
  notion: LayoutTemplate,
  template: FolderArchive,
  guide: BookOpen,
  tool: Wrench,
};

const DownloadsLibrary: React.FC<DownloadsLibraryProps> = ({ resources }) => {
  const [query, setQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState<'all' | DownloadResourceKind>('all');

  const filteredResources = useMemo(
    () => filterDownloadResources(resources, { kind: selectedKind, query }),
    [query, resources, selectedKind],
  );

  const resourceCount = filteredResources.length;
  const statusCopy = `${resourceCount} ${resourceCount === 1 ? 'resource' : 'resources'} available`;

  return (
    <div className="downloads-cabinet">
      <section className="downloads-hero" aria-labelledby="downloads-page-title">
        <div className="downloads-shell downloads-hero__grid">
          <div className="downloads-hero__copy">
            <p className="downloads-eyebrow">
              <Sparkles aria-hidden="true" />
              Resource cabinet
            </p>
            <h1 id="downloads-page-title">Keep the tools that make ideas useful.</h1>
            <p className="downloads-hero__lede">
              Practical PDFs, field guides, and ready-to-use templates for reading with intention and reviewing your work with clarity.
            </p>
            <a className="downloads-button downloads-button--cream" href="#resource-library-title">
              Browse the cabinet
              <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <div className="downloads-stack" aria-hidden="true">
            <div className="downloads-stack__sheet downloads-stack__sheet--back">
              <span>GUIDE</span>
              <FileText />
              <i />
              <i />
            </div>
            <div className="downloads-stack__sheet downloads-stack__sheet--middle">
              <span>PDF</span>
              <Download />
              <i />
              <i />
            </div>
            <div className="downloads-stack__sheet downloads-stack__sheet--front">
              <span>NOTION</span>
              <LayoutTemplate />
              <strong>TA7LEEL<br />FIELD KIT</strong>
              <small>Save it. Use it. Return to it.</small>
            </div>
          </div>
        </div>
      </section>

      <div className="downloads-shell downloads-body">
        <section className="downloads-library" aria-labelledby="resource-library-title">
          <div className="downloads-library__header">
            <div>
              <p className="downloads-kicker">Your working shelf</p>
              <h2 id="resource-library-title">Resources built for repeated use</h2>
              <p>Choose a format, find what you need, and put it to work.</p>
            </div>

            <label className="downloads-search" htmlFor="resource-search">
              <span>Search resources</span>
              <span className="downloads-search__field">
                <Search aria-hidden="true" />
                <input
                  id="resource-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Journal, guide, template…"
                />
              </span>
            </label>
          </div>

          <div className="downloads-library__tools">
            <nav className="downloads-filters" aria-label="Filter resources by format">
              {DOWNLOAD_RESOURCE_KINDS.map((kind) => (
                <button
                  key={kind.value}
                  type="button"
                  aria-pressed={selectedKind === kind.value}
                  onClick={() => setSelectedKind(kind.value)}
                >
                  {kind.label}
                </button>
              ))}
            </nav>
            <p className="downloads-count" role="status" aria-live="polite">
              {statusCopy}
            </p>
          </div>

          {filteredResources.length > 0 ? (
            <div className="downloads-resource-grid">
              {filteredResources.map((resource) => {
                const Icon = resourceIcons[resource.kind];
                const action = getDownloadAction(resource);

                return (
                  <article
                    key={resource.id}
                    className={`downloads-resource-card${resource.featured ? ' downloads-resource-card--featured' : ''}`}
                  >
                    <div className="downloads-resource-card__mark" aria-hidden="true">
                      <Icon />
                    </div>

                    <div className="downloads-resource-card__content">
                      <div className="downloads-resource-card__labels">
                        {resource.featured && <span className="downloads-featured-label">Featured</span>}
                        <span>{resource.category}</span>
                      </div>
                      <h3>{resource.title}</h3>
                      <p>{resource.description}</p>
                      <dl className="downloads-resource-card__meta">
                        <div>
                          <dt>Format</dt>
                          <dd>{resource.format}</dd>
                        </div>
                        <div>
                          <dt>Updated</dt>
                          <dd>{formatResourceDate(resource.updatedAt)}</dd>
                        </div>
                      </dl>
                    </div>

                    <a
                      className="downloads-resource-card__action"
                      href={resource.fileUrl}
                      target={action.external ? '_blank' : undefined}
                      rel={action.external ? 'noopener noreferrer' : undefined}
                      download={action.downloadName}
                    >
                      <span>{action.label}</span>
                      {action.external ? <ArrowUpRight aria-hidden="true" /> : <Download aria-hidden="true" />}
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="downloads-empty" role="status">
              <div className="downloads-empty__icon" aria-hidden="true"><FolderArchive /></div>
              <h3>New resources are being prepared.</h3>
              <p>
                {resources.length > 0
                  ? 'Try another format or clear your search to return to the full cabinet.'
                  : 'The next field kits will appear here. Until then, keep exploring the ideas already in the library.'}
              </p>
              {resources.length > 0 ? (
                <button
                  type="button"
                  className="downloads-button downloads-button--forest"
                  onClick={() => {
                    setQuery('');
                    setSelectedKind('all');
                  }}
                >
                  Show all resources
                </button>
              ) : (
                <Link className="downloads-button downloads-button--forest" to="/summaries">
                  Browse book summaries
                  <ArrowRight aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </section>

        <aside className="downloads-notes" aria-label="About the resource library">
          <div className="downloads-notes__statement">
            <span className="downloads-notes__icon" aria-hidden="true"><BookOpen /></span>
            <div>
              <p className="downloads-kicker">Included with your account</p>
              <h2>Built to leave your browser.</h2>
              <p>Every resource is free for Ta7leel members and designed to stay useful after the tab closes.</p>
            </div>
          </div>

          <div className="downloads-support">
            <Coffee aria-hidden="true" />
            <div>
              <strong>Help us make the next field kit.</strong>
              <span>Support more practical reading and trading resources.</span>
            </div>
            <a href="https://ko-fi.com/ta7leel" target="_blank" rel="noopener noreferrer">
              Support on Ko-fi
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DownloadsLibrary;
