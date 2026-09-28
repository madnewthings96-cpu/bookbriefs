# BookBriefs Canva Ebook Template Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the existing 22-page Canva ebook into a polished, reusable Arabic BookBriefs template while preserving its content and page order.

**Architecture:** Apply one visual system across seven reusable page types, beginning with global design tokens and representative pages before propagating the treatment to the remaining pages. Work directly in the Canva editor and validate every batch in both page view and grid view so RTL text, overflow, and image consistency remain visible throughout.

**Tech Stack:** Canva web editor in the Codex in-app browser; visual and accessibility-tree inspection; Canva auto-save and undo history.

**Spec:** `docs/superpowers/specs/2026-09-20-bookbriefs-canva-ebook-template-design.md`

## Global Constraints

- Preserve the existing 22-page order and written content.
- Do not rewrite, summarize, translate, or fact-check the book content.
- Do not remove substantive text.
- Use a warm ivory base (`#F2E5CA`), charcoal text (`#292929`), muted sand dividers (`#C9B58D`), and a book-specific blue accent (`#176B87`).
- Use `Noto Kufi Arabic` for display headings and `Noto Naskh Arabic` for body copy.
- Keep Arabic content right-aligned and verify mixed Arabic/English text for correct RTL/LTR flow.
- Retain Ta7leel branding, website, and page numbers as restrained footer elements.
- Remove Ko-fi promotion from reading pages and retain one polished Ko-fi promotion on page 22.
- Edit the existing Canva file directly and leave it open for user review when complete.

---

### Task 1: Audit and Lock the Visual System

**Canva surface:** Existing design `DAHVwONbHw4`, all 22 pages.

**Interfaces:**
- Consumes: approved design specification and the current 22-page Canva design.
- Produces: a confirmed map of page types plus exact colors, typefaces, hierarchy, margins, footer treatment, and image framing used by later tasks.

- [ ] **Step 1: Inspect the complete document in grid view**

Open grid view at a workspace large enough to display multiple page thumbnails. Record which pages function as the cover, introduction/author pages, chapter openers, continuation pages, review/conclusion pages, and final CTA.

- [ ] **Step 2: Inspect representative pages at readable zoom**

Open pages 1, 2, 4, 8, 14, 20, and 22 individually. Confirm the existing body text fits before any font or spacing change, and note pages with clipped text, inconsistent imagery, or misplaced branding.

- [ ] **Step 3: Lock the visual tokens**

Use the following system throughout the document:

- Background: `#F2E5CA`
- Primary text: `#292929`
- Divider and secondary line: `#C9B58D`
- Book accent: `#176B87`
- Display face: `Noto Kufi Arabic`, bold for cover and major section titles
- Body face: `Noto Naskh Arabic`, regular for paragraphs and bold for inline labels
- Layout: approximately 8% side margins and 6% top/bottom safe area
- Footer: centered Ta7leel mark with website or page number, using a single consistent baseline
- Images: rectangular crop, consistent corner treatment, and no decorative screenshot borders

- [ ] **Step 4: Rename the Canva design**

Set the design title to `BookBriefs — The Power of One More — Master Ebook Template` so the reusable source is easy to locate.

- [ ] **Step 5: Verify the design remains unchanged apart from the title**

Return to grid view and confirm there are still exactly 22 pages in the original order.

### Task 2: Rebuild the Cover and Opening Sequence

**Canva surface:** Pages 1–3.

**Interfaces:**
- Consumes: locked visual tokens from Task 1.
- Produces: a reusable cover, introduction/author layout, and clean opening continuation page that define the visual language for the rest of the ebook.

- [ ] **Step 1: Rebalance page 1 cover hierarchy**

Keep the book cover image prominent in the upper half. Arrange the Arabic title first, the English title second, the author beneath, and the Ta7leel identity at the bottom. Remove unnecessary decorative lines, keep one muted-sand divider, and apply the book-blue accent only to a small label or rule.

- [ ] **Step 2: Standardize page 1 typography**

Apply `Noto Kufi Arabic` bold to the main title, `Noto Naskh Arabic` bold to the author line, and a smaller regular body style to the subtitle and website. Ensure no title line touches the side margins.

- [ ] **Step 3: Rebuild page 2 as the introduction/author template**

Use one right-aligned title block at the top, one readable body column, and one consistently framed author image. Treat `الكاتب:` as a small accent label and keep the author name visually subordinate to the page title.

- [ ] **Step 4: Clean page 3 and remove the Ko-fi promotion**

Retain the two opening paragraphs and supporting image, remove the Ko-fi element and link from the reading page, then redistribute vertical spacing so the page ends naturally above the footer.

- [ ] **Step 5: Validate pages 1–3**

Check that all text remains intact, RTL alignment is correct, page numbers remain `02` and `03`, and the cover, author image, and supporting image use coherent sizing.

### Task 3: Normalize the Core Chapter Templates

**Canva surface:** Pages 4–13.

**Interfaces:**
- Consumes: opening-page typography, margins, footer baseline, label treatments, and image framing from Task 2.
- Produces: consistent chapter opener and continuation templates reusable for later chapters and future ebooks.

- [ ] **Step 1: Establish page 4 as the chapter-opener reference**

Format `ثانياً. ملخصات شاملة للفصول` as the section title and `الفصل 1: هوية "واحدة أخرى"` as the chapter heading. Use the accent color sparingly in the section label or divider, not in body paragraphs.

- [ ] **Step 2: Establish the content hierarchy on page 4**

Use bold body labels for `التعاليم الأساسية`، `السبب (الـ "لماذا")`، and `الطريقة (الـ "كيف")`. Keep supporting sentences regular, right-aligned, and visually separated by consistent paragraph spacing.

- [ ] **Step 3: Apply the hierarchy to pages 5–8**

Normalize chapter titles, bullets, nested bullets, body spacing, page numbers, and footer placement. Preserve all wording and images while removing inconsistent heading sizes and ad hoc line spacing.

- [ ] **Step 4: Apply the hierarchy to pages 9–13**

Continue the same chapter-opener and continuation treatments for chapters 5 through 9. Resize or reframe images only where they interrupt the text rhythm or differ visibly from the established image treatment.

- [ ] **Step 5: Validate pages 4–13 in grid view and page view**

Confirm the chapter sequence remains intact, page numbers run from `04` through `13`, no body text overflows, and every label uses the same visual treatment.

### Task 4: Normalize the Remaining Chapters and Analysis Pages

**Canva surface:** Pages 14–19.

**Interfaces:**
- Consumes: chapter-opener and continuation templates from Task 3.
- Produces: a visually consistent end to the chapter summaries plus a distinct but related treatment for synthesis and critical-review content.

- [ ] **Step 1: Inspect pages 14–19 at readable zoom**

Classify each page as chapter continuation, synthesis, key takeaways, critical review, or conclusion before changing its hierarchy.

- [ ] **Step 2: Apply chapter styles to remaining chapter pages**

Use the exact Task 3 title, label, bullet, body, footer, and image treatments on every remaining chapter-summary page.

- [ ] **Step 3: Differentiate synthesis and review pages**

Use the same typography and margins but add one muted-sand divider and a small book-blue section label so analysis pages are distinguishable without becoming a new visual style.

- [ ] **Step 4: Standardize quotation or takeaway treatments**

Replace screenshot-like quote presentation with a consistent text block using body typography, an accent rule, and attribution. Do not alter the quotation wording.

- [ ] **Step 5: Validate pages 14–19**

Confirm all text remains present, analysis pages are visually distinct but coherent, images share the established framing, and footers align with pages 4–13.

### Task 5: Build the Conclusion and Final Ko-fi CTA

**Canva surface:** Pages 20–22.

**Interfaces:**
- Consumes: typography, colors, margins, image framing, and footer system from Tasks 1–4.
- Produces: a polished conclusion sequence and the document’s only promotional page.

- [ ] **Step 1: Format pages 20–21 as closing content**

Use the established section-title and body hierarchy. Emphasize final recommendations or takeaways with the same accent-rule treatment used on analysis pages, without introducing new decorative styles.

- [ ] **Step 2: Rebuild page 22 as the final CTA**

Create a clear closing hierarchy: one concise thank-you or completion heading, a short Ta7leel follow-up line, the single Ko-fi promotion, and website/social references. Keep the CTA centered and separated from footer branding.

- [ ] **Step 3: Confirm Ko-fi placement**

Search the document visually and through the accessibility tree for `ko-fi.com/ta7leel`. Verify it exists only on page 22 and remains clickable.

- [ ] **Step 4: Validate pages 20–22**

Confirm the ebook finishes with a calm progression from conclusion to CTA and that no promotional element appears on reading pages.

### Task 6: Whole-Document Visual QA

**Canva surface:** Pages 1–22.

**Interfaces:**
- Consumes: refreshed document from Tasks 1–5.
- Produces: a verified, auto-saved Canva master template ready for user review and future duplication.

- [ ] **Step 1: Review all pages in grid view**

Check that the cover, opening sequence, chapter pages, analysis pages, conclusion, and CTA form one recognizable visual system. Flag any thumbnail that has a noticeably different background, margin, heading scale, image treatment, or footer baseline.

- [ ] **Step 2: Review every page at readable zoom**

Inspect pages 1 through 22 sequentially for clipped Arabic characters, overflow, awkward line breaks, RTL/LTR ordering, image distortion, footer collisions, and inconsistent bullet indentation.

- [ ] **Step 3: Verify document invariants**

Confirm exactly 22 pages remain in the original order, every substantive text block is present, page numbers are sequential, Ta7leel branding is restrained and consistent, and Ko-fi appears only on page 22.

- [ ] **Step 4: Confirm Canva save state**

Wait for Canva’s header to show `All changes saved`, then leave the editor open on grid view so the user can scan the complete result.

- [ ] **Step 5: Report the completed changes**

Summarize the visual system applied, list any pages that required special handling, and tell the user that the Canva editor is open for review.
