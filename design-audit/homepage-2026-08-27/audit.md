# Ta7leel homepage discovery audit — 2026-08-27

## Outcome

The existing homepage has a cohesive warm editorial visual system and strong book-cover presentation, but it behaves mainly as a long conversion landing page. The redesign should make the first viewport a useful Arabic-first discovery surface: direct search, clear intent paths, and crawlable category/summary links.

Evidence captured in this run:

- `01-home-desktop-1432.png`
- `02-home-tablet-834.png`
- `03-home-mobile-390.png`
- `04-search-desktop.png`
- `05-mobile-search.png`

## 1. Discovery and information hierarchy

| Before | After |
| --- | --- |
| The hero leads with a broad English promise and promotional illustration; users must pass “How it works” before reaching real books. | Put a concise Arabic promise, homepage search, and 4–6 intent/category links in the first viewport. Keep any illustration secondary. |
| “Most Read” and four useful reading paths exist, but category hubs and new content are absent from the homepage. | Follow search with clearly labelled lanes: conditional Continue Reading, Most Read / editor pick, goal paths, category hubs, and New This Week. |
| Reading paths are hardcoded directly to book slugs, including aliases that can drift from real Firestore/Arabic slugs. | Keep the outcome model but back each path with stable hub or curated-collection destinations and validated real book links. |
| A large testimonial/conversion tail makes the homepage roughly 6,900px at tablet and 8,900px at mobile. | Collapse product explanation into one proof block and use one restrained retention CTA near the footer. |

## 2. Navigation and responsive continuity

| Before | After |
| --- | --- |
| Desktop primary navigation is `hidden lg:flex`, while the main-menu button and bottom navigation are `md:hidden`. At 768–1023px the primary navigation disappears. | Use one continuous breakpoint contract: keep a reachable menu trigger until the full desktop navigation is visible. |
| The outer `main.container` jumps from about 768px wide at viewport 1023 to about 1016px at 1024, creating a 248px discontinuity. | Use full-bleed page sections with their own stable `max-w-7xl` inner wrappers and responsive padding. |
| Mobile shows both a drawer and fixed bottom navigation; search is hidden inside the drawer. | Make homepage search the first content after the header. Keep one clear mobile navigation model and reserve drawer space for secondary/account actions. |
| Footer contains social links and Privacy but omits most product IA and Terms. | Add concise Library, Categories, Tools, Learn, About, Privacy, and Terms groups with real links. |

## 3. Arabic, RTL, and mixed-direction content

| Before | After |
| --- | --- |
| `/ar/book-summaries` changes SEO text but renders the English hero and controls; the document remains `lang="en" dir="ltr"`. | Set the Arabic experience semantically with `lang="ar" dir="rtl"` and localized UI/content. |
| RTL support relies on a `body.rtl` class and physical left/right utilities; the language context currently exposes English only. | Use logical inline-start/end properties and an explicit route/language contract. |
| Mixed Arabic/Latin titles and authors are not consistently isolated. | Apply `dir="auto"` or `bdi` to titles, authors, and queries. Mirror reading-flow arrows, not covers, numbers, charts, or media controls. |

## 4. Search, category hubs, and internal linking

| Before | After |
| --- | --- |
| Header search works for titles/authors and summary/takeaway text, but it navigates directly to the first result on submit. | Reuse the live result model in an anchored homepage search panel with keyboard navigation and explicit result selection. |
| Library search/filter state is local. Structured data advertises `/summaries?search=...`, but that URL does not populate the field or results. | Unify the URL/search contract so shared and structured-data search URLs reproduce visible state. |
| Five category-hub routes and sitemap entries exist, but homepage/header/footer/library chips do not point to them. | Link Home → Category hub → Summary using real anchors and descriptive Arabic text. |
| An invalid category slug silently falls back to Trading. | Return a real not-found/empty state; never show a different category for an invalid URL. |
| Category hubs are currently a hero plus one grid. | Enrich each valuable hub with a unique intro, featured/popular/latest summaries, related hubs, and breadcrumbs. Keep ordinary filter combinations as UI state instead of indexable landing pages. |

## 5. Interaction and accessibility

| Before | After |
| --- | --- |
| Major CTAs and book cards generally have generous hit areas and useful focus styling. | Preserve the 44–48px target language and visible focus rings. |
| The mobile menu button removes its focus outline without adding a replacement. | Add a clear `focus-visible` ring. |
| Desktop mega-menu focus changes the active menu while the menu links occur later in DOM order, so tabbing through top-level buttons can overwrite the panel before links are reached. | Use a keyboard-safe menu pattern with predictable focus entry/exit and Escape behavior. |
| The testimonial strip runs continuously, duplicates every card in the accessibility tree, and has no pause or reduced-motion branch. | Use a static or controlled testimonial treatment, hide duplicates, provide pause when motion exists, and honor `prefers-reduced-motion`. |
| Search uses placeholder text as its visible label. | Keep a persistent programmatic label and announce result count/loading state. |

## Strengths worth preserving

- Warm cream/sand/copper palette and tactile editorial card system.
- Clear one-H1 / section-H2 / card-H3 hierarchy.
- Real covers, direct summary links, and a tangible sample-summary proof section.
- Outcome-led reading paths and a practical 10-minute reading promise.
- Responsive grids avoid horizontal overflow at 390px.

## Recommended homepage order

1. Continuous header with unified navigation and search access.
2. Compact Arabic promise, main search, and crawlable intent/category shortcuts.
3. Conditional “أكمل القراءة” only when real reading state exists.
4. “الأكثر قراءة” plus a distinct editor pick.
5. Four goal-led reading paths using current books.
6. Five substantive category-hub entry points.
7. “جديد في المكتبة”.
8. One compressed product-proof or retention CTA.
9. Comprehensive footer.

## Research basis

- Discovery products pair search with browse lanes and editorial collections: [Shortform](https://www.shortform.com/blog/how-to-use-shortform/), [Medium](https://help.medium.com/hc/en-us/articles/115012586467-Your-homepage), [Blinkist categories](https://www.blinkist.com/en/content/categories), [Headway library](https://makeheadway.com/library/).
- Semantic bidi guidance: [W3C](https://www.w3.org/International/questions/qa-html-dir.html), [Material](https://m3.material.io/foundations/layout/bidirectionality-rtl), [Apple](https://developer.apple.com/design/human-interface-guidelines/right-to-left).
- Crawlable hierarchy, links, facets, and pagination: [Google site structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure), [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [faceted navigation](https://developers.google.com/crawling/docs/faceted-navigation), [pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading).

## Evidence limits

The audit covered the public homepage, search states, representative library/category routes, source structure, and sampled desktop/tablet/mobile widths. It did not include a full screen-reader session, authenticated reading-state flows, browser zoom beyond sampled widths, or automated contrast measurements.

