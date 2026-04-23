# ContentStack Content Type References

This doc covers one of the most important concepts in content modeling: **references** between content types. If you've only used a headless CMS to store flat records, references are the feature that turns it into a structured content platform. The FAQ Section feature in this repo uses references at two levels, so we'll use it as the running example.

## What is a reference field?

A **reference field** is a field whose value is a link to another entry (or set of entries). You add a reference field to a content type the same way you add any other field, except the field's "type" is "Reference" and its configuration includes:

- **Which content type(s) it can point to** — e.g. a `faqs` reference field might be restricted to the `faq` content type so editors can't accidentally pick a blog post.
- **Single or multiple** — can this field hold one reference or many?
- **Required or optional** — can the field be empty?

In our codebase:

- The `faq_section` content type has a `faqs` field: **multiple reference → `faq`** (one FAQ Section can list many FAQs).
- The `page` content type's `blocks` modular field has a `faq_section` variant that contains a `section` field: **single reference → `faq_section`** (one block points to one FAQ Section entry).

## Why references exist — two use cases

### Use case 1: one-to-many relationships

The FAQ Section `faqs` field is the textbook example. You don't want to retype each FAQ inside every FAQ Section entry — you want to maintain FAQs once and reference them from sections that need them. One FAQ entry can be referenced by many sections simultaneously. When an FAQ is edited, every section that references it sees the update automatically.

### Use case 2: reusable content blocks

The `page.blocks.faq_section.section` reference is the "reusable component" use case. Rather than embedding all of the FAQ Section's fields (heading, subtitle, FAQs list) inside every page that has an FAQ section, we reference a single canonical FAQ Section entry. Ten different pages can reference the *same* FAQ Section — editors update it once and all ten pages reflect the change.

## Inline variant vs. top-level content type

This is the key modeling decision when you add a new block type.

### Inline — the block variant carries all its fields directly

```
page.blocks[0] = {
  faq_section: {
    heading: "Frequently Asked Questions",
    subtitle: "...",
    faqs: [<reference to faq 1>, <reference to faq 2>, ...]
  }
}
```

- **Simpler** — one content type, one query, one thing for editors to manage.
- **No reuse** — every page that wants an FAQ section has its own copy of the heading/subtitle/FAQ list.

### Top-level — the block variant contains a reference to a separate content type

```
page.blocks[0] = {
  faq_section: {
    section: [<reference to faq_section entry>]
  }
}

// where faq_section entry = {
//   title: "Frequently Asked Questions",
//   subtitle: "...",
//   faqs: [<reference to faq 1>, ...]
// }
```

- **Reusable** — one FAQ Section entry, referenced from many pages.
- **Independent lifecycle** — editors can update the FAQ Section without republishing every page that uses it.
- **More moving parts** — editors navigate to two places; the Angular code resolves references at two levels.

### Rule of thumb

Start inline; promote to top-level when you need reuse. The refactor from inline to referenced is well-understood: create a new top-level content type, move entries' data into new entries of that type, change the modular block variant to hold a reference instead of the fields directly. The reverse (collapsing a top-level type back into inline) is much rarer.

**This tutorial chose the top-level approach** intentionally, to teach the more production-realistic pattern.

## How references appear in the API

Out of the box, a reference field is returned as a stub:

```json
{
  "section": [
    { "uid": "blt3e8fb...", "_content_type_uid": "faq_section" }
  ]
}
```

Just the UID and the content type — no title, no subtitle, no FAQ list. That's because resolving every reference every time would blow up response sizes and API response times for deep content graphs.

To get the full entry inlined into the response, you tell the SDK to **include** the reference:

```ts
stack.contentType('page').entry()
  .includeReference('blocks.faq_section.section')
  .query()
  .where('url', QueryOperation.EQUALS, url)
  .find<PageWithBlocks>()
```

The path `blocks.faq_section.section` reads as "inside each `blocks` item, inside the `faq_section` variant, resolve the `section` reference field."

Now the response contains:

```json
{
  "section": [
    {
      "uid": "blt3e8fb...",
      "_content_type_uid": "faq_section",
      "title": "Frequently Asked Questions",
      "subtitle": "...",
      "faqs": [
        { "uid": "blt1a2b3c4d...", "_content_type_uid": "faq" },
        { "uid": "blt5e6f7g8h...", "_content_type_uid": "faq" },
        ...
      ]
    }
  ]
}
```

Closer — but the `faqs` inside the resolved FAQ Section are still stubs. We have references inside a reference.

## Nested references — chaining `.includeReference`

You can resolve references inside references by extending the path:

```ts
.includeReference([
  'blocks.faq_section.section',
  'blocks.faq_section.section.faqs'
])
```

The second path says "inside each resolved `section` entry, also resolve the `faqs` reference field." Now the response contains fully-populated FAQ entries, ready to render.

> There's a limit to how deep references can be resolved in a single call (the exact depth depends on your ContentStack plan and SDK version — check the current docs if you're nesting many levels). For this tutorial we're 3 levels deep and well within any limit.

## What this looks like in the codebase

In `src/app/services/contentstack.service.ts`:

```ts
getPageWithBlocks(url: string): Observable<PageWithBlocks | null> {
  return from(
    this.stack
      .contentType('page')
      .entry()
      .includeReference([
        'blocks.faq_section.section',
        'blocks.faq_section.section.faqs'
      ])
      .query()
      .where('url', QueryOperation.EQUALS, url)
      .find<PageWithBlocks>()
      .then((result: any) => (result.entries[0] ?? null) as PageWithBlocks | null)
  );
}
```

A single request returns the page, its FAQ section block, the linked FAQ Section entry, and every FAQ inside it — all in one round trip.

## Filtering the reference picker (editor experience)

When an editor adds a reference, they see a modal listing candidate entries. Two things matter at scale:

1. **Search by title** — always works. Fast even for thousands of entries.
2. **Filter by tags** — ContentStack entries have a built-in `tags` array field. The picker supports tag filtering. For a catalog of 3,000 FAQs tagged by topic, an editor can narrow to the 200 tagged `pricing` with one click.

You cannot pre-restrict a reference field to "only entries with tag X" at the schema level — that's an editor-time filter. If you need structured hierarchical filtering (not just flat tags), ContentStack offers **Taxonomies** as a more robust alternative; outside the scope of this tutorial.

## Common pitfalls

**Forgot `.includeReference(...)`** — references come back as UID stubs. Check your query; if you expect a resolved field and see only `{ uid, _content_type_uid }`, you're missing an include path.

**Wrong include path** — the path must match the API shape, including the modular block variant name. For `blocks.faq_section.section`, if your variant UID is actually `FaqSection` (camelCase) the path won't match. UIDs are case-sensitive.

**Reference field returns an array even when "Single" is configured** — ContentStack wraps reference values as arrays regardless of cardinality. A "single" reference returns `[entry]`, and you access it with `[0]`. The TypeScript types in this repo reflect this.

**Circular references** — A references B, B references A. The SDK handles this safely but including both sides can bloat responses. Resolve only the direction you need.

## Further reading

- ContentStack documentation: "Reference" field type
- ContentStack documentation: "Include reference" parameter in the Delivery SDK
- ContentStack documentation: "Taxonomy" (for when tags aren't enough)
