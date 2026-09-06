# Extractable Components

This is the reusable-component menu for Superdesign. “Extractable props” intentionally lists only state, visibility, navigation, and count-style controls. Copy, imagery, icon choices, and visual classes remain fixed inside each extracted DraftComponent even where the React source currently receives content objects.

## Layout Components

## AppShell

- Source: `App.tsx` (`AppContent`)
- Category: layout
- Description: Global route shell with header, centered main canvas, mobile navigation, exit-intent overlay, and footer.
- Extractable props: `activePath` (string, default: `"/"`), `showExitIntent` (boolean, default: false)
- Hardcoded: Provider order, Header/MobileBottomNav/Footer composition, main-container CSS, suspense spinner, all route components

## Header

- Source: `components/Header.tsx`
- Category: layout
- Description: Responsive masthead with announcement, brand, desktop navigation, search, auth controls, mega menus, and mobile drawer.
- Extractable props: `activePath` (string, default: `"/"`), `isScrolled` (boolean, default: false), `isSearchOpen` (boolean, default: false), `isMobileMenuOpen` (boolean, default: false), `homeHref`, `libraryHref`, `calculatorsHref`, `blogHref`, `newsHref`
- Hardcoded: BookOpen logo mark and “BookBriefs” wordmark, announcement copy, navigation labels/descriptions, Lucide icon names, promo cover imagery, search styling, all Tailwind classes

## HeaderMegaMenu

- Source: `components/Header.tsx` (embedded desktop mega-menu region)
- Category: layout
- Description: Editorial desktop navigation panel with context copy, two-column link grid, and a promoted book card.
- Extractable props: `activeMenu` (string or null, default: null), `activePath` (string, default: `"/"`)
- Hardcoded: Menu headings, descriptions, promo book titles/images, item icons, all spacing/color/shadow classes

## UserMenu

- Source: `components/UserMenu.tsx`
- Category: layout
- Description: Account dropdown that switches between authenticated library actions and guest login/sign-up actions.
- Extractable props: `isOpen` (boolean, default: false), `isAuthenticated` (boolean, default: false), `profileHref`, `challengeHref`, `downloadsHref`, `feedbackHref`, `loginHref`, `signupHref`
- Hardcoded: Menu labels, inline SVG icons, dropdown geometry, feedback trigger behavior, sign-out row, all CSS classes

## MobileBottomNav

- Source: `components/MobileBottomNav.tsx`
- Category: layout
- Description: Floating mobile-only primary nav whose active item expands to show its label.
- Extractable props: `activeItem` (string, default: `"home"`), `isReaderMode` (boolean, default: false), `homeHref`, `summariesHref`, `blogHref`, `calculatorsHref`, `newsHref`
- Hardcoded: Home/BookOpen/FileText/Calculator/Newspaper icon names, labels, five-item order, iridescent helper markup, rounded dock CSS

## Footer

- Source: `components/Footer.tsx`
- Category: layout
- Description: Global warm-sand editorial footer with brand, mission, newsletter CTA, social directory, and privacy link.
- Extractable props: `newsletterHref`, `privacyHref`, `xHref`, `youtubeHref`, `koFiHref`, `telegramHref`, `instagramHref`
- Hardcoded: BookOpen logo, “BookBriefs” name, mission/newsletter copy, social labels/icons, creator avatar path, copyright wording, all grid/border classes

## LanguageSelector

- Source: `components/LanguageSelector.tsx`
- Category: layout
- Description: Compact header language dropdown; currently self-hides because only English is configured.
- Extractable props: `activeLanguage` (string, default: `"en"`), `isOpen` (boolean, default: false), `showSelector` (boolean, default: false)
- Hardcoded: English label and flag, chevron SVG, white/orange dropdown styling

## Basic Components

## Button

- Source: `components/ui/button.tsx`
- Category: basic
- Description: Generic CVA button primitive with composable Slot rendering.
- Extractable props: `disabled` (boolean, default: false)
- Hardcoded: Default/destructive/outline/secondary/ghost/link variant map, default/sm/lg/icon size map, ring behavior, all class strings

## BookCard

- Source: `components/BookCard.tsx`
- Category: basic
- Description: Warm editorial book tile reused by the summaries and category grids.
- Extractable props: `detailsHref` (string), `isFavorite` (boolean, default: false)
- Hardcoded: Per-instance cover/title/author/category/rating content, “10 min”, “Brief”, and “Read” labels, BookOpen/Clock3/Star icons, 3:4 cover treatment, all colors and shadows

## FavoriteButton

- Source: `components/FavoriteButton.tsx`
- Category: basic
- Description: Bookmark action shared by book cards, profile rows, and summary reading views.
- Extractable props: `isFavorite` (boolean, default: false), `isAuthenticated` (boolean, default: false), `showSignUpPrompt` (boolean, default: false)
- Hardcoded: Bookmark SVG path, red/white state styling, size-class map, aria copy, sign-up modal composition

## SearchResults

- Source: `components/SearchResults.tsx`
- Category: basic
- Description: Navigable search-result popover with loading and empty states.
- Extractable props: `isVisible` (boolean, default: false), `isLoading` (boolean, default: false), `activeResult` (number or null, default: null)
- Hardcoded: “Searching…” and “No results found” labels, result typography, max-height, borders, light/dark utility classes

## ConfirmDialog

- Source: `components/ui/ConfirmDialog.tsx`
- Category: basic
- Description: Reusable confirmation overlay with neutral cancellation, danger mode, and in-button progress.
- Extractable props: `isOpen` (boolean, default: false), `isLoading` (boolean, default: false)
- Hardcoded: Per-instance title/message/button copy, X and AlertTriangle icons, danger/primary color mapping, modal dimensions and classes

## SignUpPromptModal

- Source: `components/SignUpPromptModal.tsx`
- Category: basic
- Description: Guest-conversion modal used by favorite actions and the summary experience.
- Extractable props: `isOpen` (boolean, default: false), `signupHref` (string, default: `"/signup"`), `loginHref` (string, default: `"/login"`)
- Hardcoded: BookBriefs text logo treatment, benefits copy, Google/email CTA labels, inline SVGs, “5,000+ readers” proof, all styling

## FeedbackModal

- Source: `components/FeedbackModal.tsx`
- Category: basic
- Description: Header-launched feedback form with submitting, error, and success views.
- Extractable props: `isOpen` (boolean, default: false), `isSubmitting` (boolean, default: false), `submitSuccess` (boolean, default: false)
- Hardcoded: Prompt/placeholder/success/error copy, X/check/spinner SVGs, Firestore behavior, black pill submit button, modal classes

## AuthTabs

- Source: `components/AnimatedAuthComponents.tsx`
- Category: basic
- Description: Shared full-height auth-form composition used by both login and sign-up routes.
- Extractable props: `isLoading` (boolean, default: false), `isGoogleLoading` (boolean, default: false), `showError` (boolean, default: false), `showSuccess` (boolean, default: false)
- Hardcoded: Full-height centered layout, AnimatedForm composition, form field content per extracted instance, gradient/input/reveal motion styles

## AnimatedInput

- Source: `components/AnimatedAuthComponents.tsx` (`Input`)
- Category: basic
- Description: Motion-enhanced input with a cursor-following blue radial border glow.
- Extractable props: `disabled` (boolean, default: false), `showPassword` (boolean, default: false)
- Hardcoded: 100px glow radius, blue gradient, gray/zinc light-dark classes, input height and border radius

## Spinner

- Source: `components/Spinner.tsx`
- Category: basic
- Description: Shared centered coral loading indicator.
- Extractable props: None
- Hardcoded: 64px ring, coral `#FF7F50`, transparent top/bottom borders, `py-12` container

## ReadingProgressBar

- Source: `components/ReadingProgressBar.tsx`
- Category: basic
- Description: Fixed one-pixel reading progress track for long-form pages.
- Extractable props: `progress` (number, default: 0), `isVisible` (boolean, default: true)
- Hardcoded: Fixed top placement, slate translucent track, source color/transition values, scroll-derived calculation

## StatCard

- Source: `components/trading/StatCard.tsx`
- Category: basic
- Description: Compact metric card pattern suitable for dashboard KPI rows.
- Extractable props: `trend` (`"up" | "down" | "neutral"`, default: `"neutral"`), `showIcon` (boolean, default: false)
- Hardcoded: Per-instance title/value/subtitle content, ArrowUp/ArrowDown icons, emerald/rose/gray state colors, white card shadow and spacing

