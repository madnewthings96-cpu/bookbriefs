# Ta7leel / BookBriefs homepage design system

## Product and page objective

Ta7leel is a bilingual book-summary product whose primary public value is fast access to useful ideas from books. The homepage redesign must behave as a discovery surface first and a marketing page second. It should help two reader intents within the first viewport:

1. Known-item search: find a book, author, or topic quickly.
2. Guided discovery: choose a useful summary by goal, category, recency, or popularity.

The redesign is Arabic-first and semantically RTL while remaining robust for mixed Arabic and Latin book titles, author names, numbers, and queries. Keep all existing public routes and content primitives. Do not imply capabilities the product does not have.

## Brand invariants

- Preserve the current masthead lockup used in `components/Header.tsx`: Lucide `BookOpen`, the wordmark `BookBriefs`, and the smaller italic `Ta7leel` line. Do not substitute the unrelated bull favicon artwork and do not invent a new mark.
- Preserve the warm editorial identity. The page should feel like a thoughtful reading publication and personal library, not a SaaS dashboard, AI chat screen, ecommerce marketplace, or generic landing-page template.
- Book covers are editorial content. Never mirror, recolor, stretch, or decorate them with fake sale badges.
- Use real supplied book titles, covers, authors, routes, categories, and reading paths. Do not fabricate ratings, progress, recommendation logic, publication dates, testimonials, or reader counts.

## User-selected visual references

- Jitter minimal hero (`6c8160ef-ff4b-422a-b5f7-7baf12e13dee`): borrow the confidence of one concise oversized headline, quiet navigation, a single dominant action, generous whitespace, and proof/content beginning at the fold.
- Jitter modular product panel (`4784737d-016c-4aaa-9c24-6b20a253d595`): borrow its asymmetric editorial grouping, varied panel scale, strong hierarchy, and large white breathing room. Translate panels into real books, paths, and categories instead of product-feature tiles.
- Canva search discovery (`2067b7ff-7339-4d0d-acc9-5eb98f23b19b`): borrow search as the hero's main action, intent chips directly beneath it, and useful content visible immediately below. Do not copy Canva's sidebar, rainbow gradient, or marketplace density.
- These references influence composition and interaction architecture only. Retain Ta7leel's warm cream, sand, copper, and ink palette; its editorial typography; and the existing BookOpen + BookBriefs + italic Ta7leel lockup.

## Color roles

Use only the existing palette and its neutral Tailwind grays:

| Role | Value | Usage |
| --- | --- | --- |
| Page canvas | `#fffaf3` | Main page background |
| Hero / quiet surface | `#f7f0e6` | Search stage, grouped editorial sections |
| Menu surface | `#fbf6ed` | Header menus and compact panels |
| Sand | `#e5d8c7` | Pills, footer, navigation surfaces |
| Copper action | `#a75d37` | Primary CTA, active state, icon accent |
| Copper hover | `#8f4f2f` | Hover/pressed action state |
| Deep ink | `#25301f`, `#453c31`, `#111827` | Headlines and high-emphasis text |
| Warm body | `#574f43`, `#675b4d`, `#6f6558`, `#7a6f62` | Supporting copy and metadata |
| Warm rules | `#d7c7b3`, `#e7dccd`, `#e8dfd3`, `#eadfce` | Dividers, outlines, card boundaries |
| White | `#ffffff` | Elevated cards and inputs |

Avoid new gradients, neon colors, glassmorphism, dark-mode concepts, and decorative color systems. The existing copper button gradient may be reused only where already established.

## Typography

- Body/UI default: `Lato`, sans-serif.
- Interactive controls and inline-flex CTA text: `Bricolage Grotesque`, sans-serif.
- Wordmark subtitle only: `Newsreader`, serif, italic.
- Arabic display or editorial accent where useful: `Amiri` or `Scheherazade New`; keep Arabic body/UI readable and do not mix several Arabic families in one section.
- `Playfair Display` is reserved for the existing calculator-specific treatment, not the homepage.
- Headings use tight tracking, strong weight, and balanced wrapping. Body copy uses pretty wrapping and comfortable line height.
- A bold, Jitter-like headline is welcome when concise, balanced, and sized so search, intent chips, and the beginning of real content remain visible in the first viewport.

## Layout and spacing

- Desktop content maximum: `80rem` / Tailwind `max-w-7xl`, centered.
- Use responsive page padding equivalent to `px-4 sm:px-6 lg:px-8`.
- Preserve the default breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
- Do not repeat the current 768–1023px navigation gap. Primary navigation must remain reachable at every viewport.
- Avoid an outer Tailwind `container` that causes the current 1023→1024 width jump; full-bleed sections should own their internal `max-w-7xl` wrapper.
- Use the existing 4px spacing rhythm. Common section spacing is 32–64px, not 96–160px.
- Keep the complete first-view discovery composition within roughly 800px desktop height.

## Shape and surface language

- Buttons: pill or 12px radius, minimum height 44px; primary is copper with white text.
- Search input: 16–20px radius, white background, warm hairline, soft brown shadow; results anchor directly below it.
- Cards: 16–18px radius for book/editorial cards; larger section shells may use 22–24px. Nested elements use a smaller concentric radius.
- Shadows combine a subtle 1px grounding shadow with a diffuse warm-brown ambient shadow. Keep surfaces restrained and editorial.
- Book-cover images use 3:4 aspect ratio, `object-cover`, and a 10% black inset outline (`book-cover-outline`).
- Prefer fine rules, grouped editorial composition, and whitespace over uniform bento tiles.

## Interaction and motion

- Use explicit transition properties only, typically 180–300ms with `cubic-bezier(.2,0,0,1)`.
- Interactive press state uses `scale(.96)` when appropriate.
- Hover elevation is subtle (2–4px). Avoid continuous decorative motion.
- Respect `prefers-reduced-motion`. No autoplay testimonial or content carousel without pause and a reduced-motion static state.
- Search supports keyboard focus, Escape to close, and an optional `/` shortcut on desktop. Results are keyboard reachable and announced semantically.

## Arabic and bidirectionality

- Arabic homepage root: `lang="ar" dir="rtl"`.
- Use logical inline/block CSS concepts instead of physical left/right positioning.
- Use `dir="auto"` or `bdi` for unknown or mixed-language titles, authors, and search queries.
- Mirror directional navigation and reading-flow chevrons. Do not mirror book covers, logos, digits, charts, clocks, or media controls.
- Arabic prose is right-aligned. Latin-only metadata may retain its natural direction inside isolated elements.

## Accessibility

- All interactive targets are at least 44×44px.
- Every control has a visible keyboard focus state; never remove the outline without a replacement.
- Search has a persistent programmatic label, not only a placeholder.
- Preserve semantic `header`, `nav`, `main`, `section`, heading order, lists, and real anchor links.
- Category and book cards are crawlable anchors with descriptive labels.
- Color is never the sole state indicator. Maintain readable contrast on cream, sand, copper, and white surfaces.
- Duplicate decorative content is hidden from the accessibility tree.

## Real information architecture and routes

- Homepage `/`
- All summaries `/summaries`; bilingual aliases `/book-summaries` and `/ar/book-summaries`
- Category hubs:
  - `/ar/categories/trading-books`
  - `/ar/categories/investing-books`
  - `/ar/categories/business-books`
  - `/ar/categories/self-development-books`
  - `/ar/categories/psychology-books`
- Summary detail `/summary/:bookId` (IDs or Arabic slugs)
- Supporting editorial: `/blog`, `/news`, `/about`
- Retention: `/reading-challenge`, `/profile`, `/downloads`
- Tools remain discoverable in navigation: `/calculators`, `/finance-tracker`, `/trading-journal`
- Legal footer links: `/privacy-policy`, `/terms-of-use`

## Homepage content priority

The preferred hierarchy is: continuous header/navigation → compact Arabic promise plus direct search and intent links → conditional Continue Reading only when real state exists → Most Read / editorial pick → goal-led reading paths → crawlable category hubs → New in the library → one restrained retention CTA → comprehensive footer.

Search must not be the only path to content because crawlers and browsing users need real category and summary anchors. Keep advanced genre, author, rating, and sort controls on `/summaries`.

## Explicit anti-patterns

- No giant decorative hero illustration dominating the first viewport.
- No fake personalization, fabricated social proof, ratings, progress, or recommendations.
- No pricing tables, shopping-cart patterns, badges suggesting sales, or marketplace filters.
- No dashboard/bento grid, AI-chat treatment, neon gradient, glossy glass UI, or floating metric cards.
- No dozen identical carousels or visually interchangeable book rails.
- No search-only navigation, click-handler-only cards, thin category link dumps, or generic repeated “read more” anchors.
- No new fonts, palette, icon family, or logo treatment.
