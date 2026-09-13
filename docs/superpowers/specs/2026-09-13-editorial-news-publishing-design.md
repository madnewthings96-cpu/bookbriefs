# Editorial News Publishing Design

**Date:** 2026-09-13  
**Status:** Approved in conversation; awaiting written-spec review

## Summary

Replace the MQL5 economic-calendar experience at `/news` with an English-first editorial news product inspired by the hierarchy of established financial-news sites. Ta7leel will publish a small number of curated weekly market articles through a Firebase-backed admin workspace. The public page will use the selected **Editorial Stream** layout: one featured article, a chronological story feed, category filters, and a responsive Google AdSense rail.

Every published story will have an individual `/news/:slug` page with appropriate article metadata. Drafts and publishing controls will be restricted to the existing Ta7leel administrator.

## Goals

- Let the administrator create, preview, publish, update, unpublish, and delete news articles without editing the repository.
- Give readers a calm, credible weekly market-news experience instead of a raw economic-calendar feed.
- Give every article a permanent, shareable URL and useful search metadata.
- Reserve a clear, policy-compliant right rail for automated advertising.
- Preserve good behavior when Firebase, image upload, or AdSense is unavailable.
- Leave a clean path for Arabic articles later without building a bilingual editor now.

## Non-goals

- Aggregating or republishing the FXStreet feed.
- Copying FXStreet branding, copy, or visual design.
- Real-time market alerts, live prices, or an economic calendar.
- Scheduled publishing, multiple author accounts, editorial approvals, article revisions, or analytics dashboards.
- AI article generation or automated source summarization.
- Automatically triggering a production deployment after each publish in the first release.
- Building a custom consent-management platform.

## Product Decisions

- Content language is English in the first release. Each record still stores `language: "en"` to preserve a future migration path.
- Articles use individual routes such as `/news/fed-rate-outlook-september-2026`.
- The public index uses the approved Editorial Stream layout.
- Google AdSense is the first advertising network.
- The article body uses a safe Markdown subset; raw HTML is not accepted.
- Source links are stored as structured fields and shown separately from the article body.

## Architecture

The feature stays inside the existing React, Firebase, and Netlify application.

### Public data path

1. `NewsPage` requests published articles from a focused news repository/service.
2. The repository queries Firestore with `status == "published"`, orders by `publishedAt` descending, and returns a page of normalized records.
3. The page reads the single `newsConfig/editorial.featuredArticleId` reference. If it is empty or does not point to a published record, the newest published article becomes the visual lead without modifying stored data.
4. Selecting a story routes to `NewsArticlePage`, which resolves the public slug mapping and then fetches the published article.
5. Public clients never request draft records. Firestore rules independently reject access to drafts.

### Admin data path

1. `/admin/news` is protected by authentication and an admin-only route check using the existing administrator identity.
2. Firestore and Storage rules repeat that authorization server-side; hiding a route is not treated as security.
3. The editor validates input locally and saves records through the same news repository.
4. A new image is uploaded only when a draft is saved or published. After upload succeeds, the article receives the download URL and storage path.
5. Publishing sets `publishedAt` on first publication and always updates `updatedAt` using server timestamps.
6. Featuring an article updates the single `newsConfig/editorial` document, so there is only one source of truth for the featured article.
7. First publication reserves the slug in a `newsArticleSlugs` mapping document inside the same transaction. This makes uniqueness enforceable instead of relying on a race-prone client query.

### Modules and responsibilities

- `NewsPage`: public index composition, filters, pagination, and page-level states.
- `NewsArticlePage`: individual article presentation and article-specific SEO.
- `AdminNewsPage`: draft/published inventory and editorial actions.
- `NewsArticleEditor`: controlled form, validation, preview, image selection, and save/publish actions.
- `AdSlot`: AdSense configuration, loading, reserved dimensions, and no-inventory behavior.
- `newsRepository`: Firestore queries and mutations. React components do not contain raw query construction.
- `newsModel`: record normalization, validation, slug generation, date formatting, and pure selection helpers.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/news` | Public | Featured story, filters, article stream, and ad rail |
| `/news/:slug` | Public for published records | Full article, sources, related stories, and ad rail |
| `/admin/news` | Existing administrator only | Article inventory and create action |
| `/admin/news/new` | Existing administrator only | Create a draft |
| `/admin/news/:articleId` | Existing administrator only | Edit, preview, publish, or unpublish an article |

The route order must keep `/admin/news/*` and `/news/:slug` unambiguous.

## Firestore Model

Collection: `newsArticles`

```ts
interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: 'markets' | 'forex' | 'economy' | 'crypto';
  language: 'en';
  authorName: string;
  imageUrl: string;
  imagePath: string;
  imageAlt: string;
  sources: Array<{ label: string; url: string }>;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}
```

Two small supporting records make global invariants explicit:

- `newsConfig/editorial` stores `featuredArticleId: string | null`.
- `newsArticleSlugs/{slug}` stores the published `articleId`. A slug mapping is created atomically on first publication and retained when an article is unpublished, preventing an old public URL from being silently reassigned to different content.

### Validation rules

- Drafts require a title and valid category; partial body, excerpt, and image fields are allowed.
- Publishing requires a title, unique slug, excerpt, non-empty body, category, author name, featured image, and image alt text. Source links are optional, but every supplied source must be valid.
- Titles are limited to 140 characters, excerpts to 240 characters, author names to 80 characters, image alt text to 180 characters, and source labels to 120 characters.
- Slugs contain lowercase ASCII letters, digits, and single hyphens only. They are editable until first publication and immutable afterward.
- Body size is capped at 100,000 characters.
- Source URLs must use `https://` and are rendered with safe external-link attributes.
- Only published article IDs may be stored as `newsConfig/editorial.featuredArticleId`.
- The client applies these rules for useful feedback; Firestore rules enforce the record shape, allowed enums, ownership of timestamps, and admin-only mutations.

### Queries and indexes

- Main stream: published status, optional category, descending publication date, ten records per page.
- Article detail: resolve the exact public slug mapping, then read its published article document.
- Admin inventory: descending update date, with an optional status filter.
- Pagination uses Firestore cursors and a **Load more** control, not offset pagination or infinite scrolling.
- Add the composite indexes required for status/category/publication ordering and admin status/update ordering.

## Public News Index

The page replaces the current market-desk hero, briefing cards, signals, MQL5 widget, and MQL5 attribution.

### Desktop layout

- A compact editorial masthead introduces “Market News” and displays the newest publication date.
- A two-column content frame gives the editorial stream most of the width and reserves a narrower right rail for advertising.
- The featured story uses a large image, category, headline, excerpt, author, and publication date.
- Remaining stories appear newest first as compact horizontal cards.
- Category controls are `All`, `Markets`, `Forex`, `Economy`, and `Crypto`.
- The right rail contains a clearly labeled AdSense slot and may remain sticky only while it stays fully inside the viewport and never overlaps the footer.

### Mobile layout

- Content becomes one column.
- Cards keep readable headlines and proportional thumbnails without horizontal scrolling.
- The advertisement appears after the first three non-featured stories. When fewer stories exist, it appears after the available stream rather than before the lead story.
- Filters remain keyboard accessible and can scroll horizontally when necessary.

### Page states

- **Loading:** stable skeletons reserve the final card and ad dimensions.
- **Empty:** explain that the next weekly briefing is being prepared; do not show fake headlines.
- **Recoverable error:** retain already loaded stories, show a compact status message, and offer Retry.
- **Initial error:** show a calm full-width error state with Retry and navigation back to the rest of Ta7leel.

## Individual Article Page

- Show category, title, excerpt, author, publication date, and updated date when materially different.
- Render the featured image with descriptive alt text.
- Render the safe Markdown subset already supported by Ta7leel: headings, paragraphs, emphasis, lists, blockquotes, and horizontal rules. Raw HTML and scripts are displayed as text, never executed.
- Present structured source links under a visible **Sources** heading.
- Add a brief statement that the article is general information, not investment advice.
- Show up to three related published stories, preferring the same category and excluding the current article.
- Use the same responsive advertising behavior as the index, with no ad inserted inside the article body in the first release.
- Unknown, draft, unpublished, or malformed slugs return the normal not-found experience and must not reveal draft metadata.

## Admin Experience

### Inventory

- Show title, category, status, featured state, and last update.
- Provide `All`, `Draft`, and `Published` filters.
- Primary action: **New article**.
- Row actions: Edit, Preview, Publish/Unpublish, and Delete.
- Preview renders the current form values without exposing an unpublished public URL.

### Editor

- Fields: title, slug, excerpt, category, author, featured image, image alt text, body, sources, and featured toggle.
- Slug is generated from the title until the administrator edits it manually.
- The source list supports adding and removing label/URL pairs.
- Buttons distinguish **Save draft**, **Preview**, and **Publish**.
- Publish errors focus the first invalid field and provide a concise summary.
- Leaving with unsaved changes prompts for confirmation.
- Delete requires explicit confirmation. A successful delete removes the document and its dedicated image; an image cleanup failure is reported without pretending that the article deletion failed.
- Unpublishing removes an article from public queries but preserves `publishedAt` so republishing does not misrepresent its original publication date.

### Sample content

Development and emulator environments include one polished, clearly marked sample draft so the layout and preview can be evaluated immediately. It is never automatically written to production or exposed as a real published news story.

## Image Storage

- Initialize Firebase Storage through the existing Firebase application.
- Store dedicated article images under `news/{articleId}/`.
- Allow JPEG, PNG, and WebP images up to 5 MB.
- Require an image before publishing, but not before saving a draft.
- Show upload progress and retain the selected local preview if an upload fails.
- When replacing an image, update the article first and then remove the old object. Failure to remove the old object is logged and surfaced as a non-blocking cleanup warning.
- Public image reads require the linked Firestore article to be published. Only the administrator can read draft images or write and delete objects under the news image path.

## Advertising and Consent

- `AdSlot` reads the AdSense publisher ID and slot ID from environment configuration. It never hardcodes production IDs in source.
- Load the AdSense script once per document, only when configuration is complete and the consent flow permits it.
- Use the exact visible label **Advertisements** for a configured unit.
- Do not style an ad like an article, associate editorial imagery with it, make it float over content, animate attention toward it, or encourage clicks.
- Reserve stable dimensions to minimize layout shift. If configuration is missing, the network fails, or no inventory is returned, keep the layout stable without showing a broken iframe or fabricated advertisement.
- Use Google's certified Privacy & Messaging consent flow for regions where it is required. Do not implement a home-grown consent platform.
- Update the privacy policy to disclose advertising, cookies/local storage, consent choices, Firebase Storage, and the applicable third parties.

## SEO and Sharing

- `/news` receives an English `CollectionPage` identity and news-specific title and description.
- Each published article receives a canonical URL, Open Graph/Twitter fields, and `NewsArticle` JSON-LD containing headline, description, image, author, dates, language, publisher, and main entity URL.
- Add published article paths to the English sitemap with their `updatedAt` date.
- Extend the existing prerender pipeline to emit crawlable fallbacks for the news index and published article routes during production builds.
- The build scripts query only publicly readable published records and fail with an actionable message when production news data is expected but cannot be loaded.
- Client-side metadata updates immediately after publication. Static sitemap and prerender output refresh on the next regular deployment; automatic post-publish deployments are out of scope for this release.
- Article cards use real anchor routes so crawlers and assistive technology can discover article pages without scripted click handlers.

## Security and Privacy

- Reuse the existing administrator UID/email on both client routes and Firebase rules. Move duplicated client checks into one shared admin helper.
- Firestore public access allows article reads only when the stored record is published. Public slug and featured-configuration reads must resolve only to published articles; admin access is required for draft reads and all writes.
- Firestore rules validate allowed keys, enumerated values, field sizes, and server timestamps rather than trusting the editor.
- Storage rules restrict media type, size, path, and admin identity.
- Article content is rendered as React text nodes through the safe Markdown renderer. It is never inserted with `dangerouslySetInnerHTML`.
- External source links use `rel="noopener noreferrer"` and open behavior that does not give the destination access to the originating window.
- Ad scripts are isolated in `AdSlot`; article records cannot supply script, iframe, or ad code.

## Error Handling

- Repository operations return stable error categories for permission, offline/network, validation, conflict, and unknown failures.
- User-facing messages are concise and do not expose Firebase internals.
- Save and publish actions are disabled while their request is active to prevent duplicate mutations.
- A slug collision keeps the draft intact and asks the administrator to choose a different slug.
- Failed publication does not optimistically show the story publicly.
- A failed featured-article update leaves the previous configuration unchanged.
- Ad and consent failures never block access to editorial content.

## Accessibility and Performance

- Preserve one page-level `h1`, semantic `article`, `nav`, `aside`, list, time, and source structures.
- All editor inputs have visible labels and connected error text.
- All actions are keyboard reachable; focus moves predictably after validation, dialogs, and route changes.
- Color is not the only indicator of status or category.
- Respect reduced-motion preferences and avoid generic `transition: all` rules.
- Lazy-load non-featured images, set intrinsic dimensions/aspect ratios, and eagerly load only the lead image.
- Maintain a readable article measure and AA-level text contrast.

## Testing

### Unit tests

- Slug generation and immutability.
- Draft and publish validation.
- Article normalization and malformed-record handling.
- Featured-story reference and fallback selection.
- Category filtering, related-story selection, and cursor behavior.
- Date formatting and ad configuration states.

### Component and route tests

- Index hierarchy, semantic structure, filters, loading/empty/error states, and Load more behavior.
- Article rendering, source links, disclaimer, related stories, metadata, and not-found behavior.
- Admin inventory filters and editor validation.
- Preview never exposes a draft through a public route.
- Desktop/mobile ad placement appears in the intended content order.
- Existing application routes, header, footer, and lazy CSS loading remain intact.

### Firebase rules tests

- Anonymous users can list and read only published articles.
- Anonymous and normal authenticated users cannot read drafts or write articles/images.
- The administrator can perform valid draft and publication operations.
- Invalid keys, oversized fields/images, invalid categories, client-forged timestamps, and unsafe paths are rejected.

### Verification

- Run focused Node tests, Firebase emulator rules tests, TypeScript/build checks, SEO tests, and the production build.
- Inspect the public index, one article, the empty state, and the admin editor at desktop and mobile widths.
- Verify no MQL5 script, calendar container, or attribution remains on the new news routes.
- Verify the page remains usable with Firebase offline and with AdSense blocked.

## Rollout

1. Add models, repository behavior, rules, indexes, and tests.
2. Add the public index and article route using development fixtures.
3. Add the admin inventory/editor and Firebase Storage integration.
4. Add AdSense configuration hooks, consent integration points, privacy updates, and SEO generation.
5. Create and inspect the sample draft in an emulator or development project.
6. Deploy rules/indexes and the application, configure AdSense/CMP values, then publish the first real article through the admin editor.

## Acceptance Criteria

- The MQL5 widget and market-desk sections no longer appear at `/news`.
- A visitor can browse published weekly stories, filter them, load more, and open a stable individual article URL.
- Drafts cannot be discovered or fetched by public users.
- The administrator can complete the full draft-to-publish workflow without editing code.
- The single editorial configuration can reference at most one published featured article; the newest article becomes the visual lead when that reference is empty or invalid.
- The ad rail is clearly distinguishable, responsive, stable when empty, and non-blocking.
- Published pages have canonical metadata, `NewsArticle` structured data, and build-generated sitemap/prerender coverage.
- Images, article content, links, admin actions, and failure states meet the security and accessibility requirements above.
- Focused tests and the production build pass, with no MQL5 integration remaining.
