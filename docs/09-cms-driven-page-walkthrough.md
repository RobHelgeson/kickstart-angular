# CMS-Driven Page — End-to-End Walkthrough

This walkthrough builds a complete CMS-composed page: a new `/pages/faq-demo` route whose layout comes entirely from ContentStack. You'll create a reusable FAQ Section content type, add a new block variant to the Page content type, seed a demo page entry, and watch it render in Angular.

**Prerequisites:**

- You've completed [docs/06 — FAQ Feature Walkthrough](./06-faq-feature-walkthrough.md) and have the `faq` content type with a few published entries.
- The dev server is running (`npm run start`) and `/faq` renders correctly.

---

## Step 1 — Create the `faq_section` content type

This is a reusable content type representing one FAQ section (a heading, a subtitle, and a set of FAQ references).

1. ContentStack console → **Content Models** → **+ New Content Type**.
2. Settings:
   - **Name**: `FAQ Section`
   - **UID**: `faq_section` (confirm snake_case)
   - **Type**: **Multiple**
3. Click **Create and Add Fields**.
4. The default **Title** field is already present. Edit it (pencil icon):
   - Change display name to **Heading**
   - Keep UID as `title`
   - Mark Required ✅
5. Add field → **Single Line Textbox**:
   - Display: `Subtitle`, UID: `subtitle`
   - Not required
6. Add field → **Reference**:
   - Display: `FAQs`, UID: `faqs`
   - Reference to content type: `faq`
   - Multiple: ✅ (editors can pick many FAQs)
   - Required ✅
7. Save.

<screenshot: the FAQ Section content type with title/subtitle/faqs fields>

**Why we created this as a top-level content type** rather than embedding the fields directly in the page's modular blocks: a top-level type means one FAQ Section entry can be referenced from many pages. Update the section once — every page that uses it reflects the change. See [docs/07 — Content Type References](./07-content-type-references.md) for the full discussion of this trade-off.

---

## Step 2 — Create one FAQ Section entry

1. **Entries** → content type dropdown → **FAQ Section** → **+ New Entry**.
2. Fill in:
   - Heading: `Frequently Asked Questions`
   - Subtitle: `Common questions from developers using ContentStack`
   - FAQs: click **Choose an entry** and select all three of the FAQ entries you seeded in docs/06.
3. **Save & Publish** to the same environment your app reads from (the one in your `.env`).

<screenshot: the FAQ Section entry form with three FAQs selected>

---

## Step 3 — Add a new block variant to the `page` content type

This is where the `page` content type learns a new trick: it can now contain FAQ Section blocks.

1. **Content Models** → **Page**.
2. Locate the **Blocks** field (a Modular Blocks field, already present with a `block` variant containing image/title/copy/layout).
3. Click its pencil to edit the modular blocks field.
4. Inside the modular blocks editor, add a new block variant:
   - Display name: `FAQ Section`
   - UID: `faq_section`
5. Inside that new variant, add one field:
   - **Reference** field
   - Display: `Section`, UID: `section`
   - Reference to content type: `faq_section`
   - **Single** reference (not multiple — one FAQ Section entry per block)
   - Required ✅
6. Save the content type.

<screenshot: the Page content type's Blocks field with the new FAQ Section variant visible>

**Why two levels named `faq_section`?** The outer name is the *modular block variant* UID (the discriminator in the API response). The inner `section` field is the reference field inside that variant. The full API path to resolve a block's FAQ Section entry becomes `blocks.faq_section.section`, which is exactly what we pass to `.includeReference(...)` in the Angular service.

---

## Step 4 — Create the demo page entry

1. **Entries** → content type dropdown → **Page** → **+ New Entry**.
2. Fill in:
   - Title: `FAQ Demo Page`
   - URL: `/pages/faq-demo`  ← **exact path matters**; Angular's resolver will look for this.
3. Leave Description, Image, Rich Text empty (all optional).
4. Scroll to the **Blocks** field → **+ Add Block** → choose **FAQ Section** (the new variant).
5. In that block's `Section` field, click **Choose an entry** and select the FAQ Section entry from Step 2.
6. **Save & Publish**.

<screenshot: the FAQ Demo Page entry with one FAQ Section block referencing the Step 2 entry>

---

## Step 5 — Verify in the browser

Navigate to `http://localhost:4200/pages/faq-demo`.

You should see:

- The page title (`FAQ Demo Page`) as an `<h1>`
- The FAQ Section heading (`Frequently Asked Questions`)
- The subtitle (`Common questions from developers...`)
- All three FAQs rendered as question + answer pairs

**DevTools Network tab check**: on page load, a single request to your ContentStack CDN with `include[]=blocks.faq_section.section&include[]=blocks.faq_section.section.faqs` (or similar) in the query string. One round trip, everything resolved.

---

## Step 6 — Test reuse (the payoff)

Create a second page entry demonstrating why we went top-level:

1. **Entries** → **Page** → **+ New Entry**.
2. Title: `Another FAQ Demo Page`
3. URL: `/pages/faq-demo-2`
4. Add a Blocks → FAQ Section block → pick the **same** FAQ Section entry from Step 2.
5. Save & Publish.

Navigate to `/pages/faq-demo-2`. Same FAQs appear. Now go edit the FAQ Section entry — change the subtitle, publish — and refresh both `/pages/faq-demo` and `/pages/faq-demo-2`. Both show the updated subtitle. That's the shared-reference pattern doing its job.

---

## Troubleshooting

**"Page not found" on `/pages/faq-demo`**: the page entry's URL field doesn't exactly match `/pages/faq-demo`, or it's not published to the correct environment. Double-check both.

**FAQ section renders with no FAQs ("No FAQs published yet.")**: either the FAQ Section entry's `faqs` field is empty, or the include paths in `contentstack.service.ts` don't match your UIDs. If you used different UIDs in the console, update the `.includeReference([...])` argument in `getPageWithBlocks`.

**FAQ section renders without heading/subtitle**: the referenced FAQ Section entry resolved to just a stub (UID only). Verify the first include path `blocks.faq_section.section` is present.

**Network request returns the page but `blocks[0].faq_section.section[0]` has only `uid` and `_content_type_uid`**: classic missing-include symptom. Reference fields are stubs by default — `.includeReference(...)` is what inlines them.

**Hero block variant shows broken**: the new block dispatcher also renders the original hero variant. If a page has both block types and the hero renders wrong, check that `block().layout`, `block().image`, etc. access the right fields — confirmed in the `HeroBlockData` type in `types.ts`.

---

## What you learned

- Top-level content types that exist to be referenced (the "reusable module" pattern).
- Modular block variants with references inside them.
- Chained `.includeReference(...)` for multi-level resolution in a single API call.
- The TypeScript discriminated-union model for block variants.
- The dispatcher pattern for rendering heterogeneous block lists.
- A three-layer component architecture that composes cleanly (dispatcher → adapter → presentational).

Next tutorials can layer on: live preview refresh for CMS-driven pages, visual builder edit tags, block ordering and conditional rendering rules, and caching strategies for large reference graphs.
