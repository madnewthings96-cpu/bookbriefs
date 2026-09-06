# Sign-up Prompt Modal Audit

## Audit scope

- Surface: gated-account prompt shown on a book-summary page
- User goal: understand the value of creating an account, choose a sign-up method, or dismiss the modal confidently
- Evidence: `01-current.png` (479 × 539) plus the current `SignUpPromptModal.tsx` implementation

## Step 1 — Account-choice modal

Health: **Usable, but visually and behaviorally behind the rest of the product.**

### Strengths

- The modal is compact, the three benefits are scannable, and there are only two primary choices.
- The dimmed backdrop separates the decision from the article.
- Both actions are full-width and easy to find.

### UX risks

1. **P1 — Brand discontinuity.** The older BookBriefs hamburger mark, neutral gray styling, and orange email CTA conflict with the new Ta7leel forest/cream/brass system. This makes the prompt feel imported rather than trustworthy and native.
2. **P1 — The Google action is not distinct in this component.** Both “Sign in with Google” and “Sign in with email” call the same generic `/signup` navigation. If Google authentication is not initiated immediately on that page, the first label overpromises and adds an unnecessary step.
3. **P2 — Account language is inconsistent.** The heading says “Create a free account,” while the actions say “Sign in.” Use either “Continue with…” for both methods or distinguish sign-up from the existing-account login below.
4. **P2 — Benefit descriptions feel appended.** Bold labels and muted descriptions run together on the same line. Shorter, outcome-based rows would scan faster: “Save bookmarks,” “Download PDF briefs,” and “Get personal recommendations.”
5. **P3 — Social proof competes with the conversion choice.** Five yellow stars plus “5,000+ readers” introduces a third accent color and feels generic. A restrained trust chip would fit the brand better.

### Accessibility risks

1. **P1 — Missing dialog semantics and focus management.** The overlay has no `role="dialog"`, `aria-modal`, labelled heading relationship, initial focus, focus trap, Escape handling, or focus restoration.
2. **P2 — The close control has no accessible name and is visually smaller than a comfortable 44 × 44 px target.**
3. **P2 — Inline SVGs are not marked decorative.** Button text still provides names, but hiding decorative icons avoids noisy accessibility output.
4. **Verification gap — RTL and zoom reflow were not captured.** The component uses directional spacing and a right-positioned close button; Arabic and 200% zoom should be checked after implementation.

## Recommended enhancement

Keep the same compact structure, but refresh it rather than rebuilding the flow:

1. Replace the BookBriefs lockup with the new Ta7leel Mind Leaf logo.
2. Use a cream modal surface, forest typography, subtle brass detail, and a solid forest primary email action.
3. Tighten the value proposition to one headline, one short supporting sentence, and three clean benefit rows.
4. Rename both method buttons to “Continue with Google” and “Continue with email.”
5. Replace the yellow-star row with a quiet “Trusted by 5,000+ readers” chip.
6. Add a soft scale/fade entrance and slight benefit-row stagger, respecting reduced-motion preferences.
7. Implement complete dialog keyboard behavior and larger controls.

## Evidence limits

The supplied screenshot captures only the open English modal. Trigger behavior, authentication success, validation, dismissal by backdrop/Escape, focus restoration, Arabic layout, and narrow-device scrolling were not exercised in this audit.
