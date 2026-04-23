# The Page Builder Pattern

This doc covers the architectural pattern behind CMS-composed pages: modular blocks in ContentStack, the dispatcher pattern in Angular, and how to wire them together cleanly. The `/pages/:slug` route in this repo is the working example.

## The idea in one paragraph

Instead of hard-coding page layouts in Angular and filling in fields from the CMS, let the CMS own the layout itself. A `page` content type has a list of **blocks**. Each block can be one of several **variants** — a hero banner, an FAQ section, a testimonial carousel, a CTA button row. Editors compose pages by dragging blocks into order; the Angular app renders each block with a dedicated component. The app doesn't know — or care — what combination of blocks will appear. New blocks can be added to ContentStack without deploying code, and new Angular block components can be added without requiring content changes.

## The ContentStack side: modular blocks

A **modular blocks field** is ContentStack's type for "a list of heterogeneous items." When you configure a modular blocks field, you define one or more **block variants** — each variant is a mini-schema with its own fields. Editors picking a block see a list of variants and choose which type to add.

In this repo, the `page` content type's `blocks` field has two variants:

- `block` — the original hero variant with `image`, `title`, `copy`, and `layout`
- `faq_section` — our new variant with a single `section` reference to an FAQ Section entry

In the API response, each item in the `blocks` array has exactly one key: the UID of the variant chosen for that item:

```json
{
  "blocks": [
    { "block":        { "title": "...", "copy": "...", "image": { ... }, "layout": "image_left" } },
    { "faq_section":  { "section": [ { ... resolved FAQ Section entry ... } ] } },
    { "block":        { "title": "Another hero", ... } }
  ]
}
```

This shape is the whole key to the pattern. Given an item, asking "which key is present?" tells you which variant it is.

## The TypeScript side: discriminated unions

We model this shape with a union type, where each member of the union is distinguishable by its single key:

```ts
// types.ts

export type HeroBlockData = {
  title?: string;
  copy?: string;
  image?: File | null;
  layout?: 'image_left' | 'image_right';
};

export type FaqSectionBlockData = {
  section: FaqSection[];
};

export type PageBlock =
  | { block: HeroBlockData }
  | { faq_section: FaqSectionBlockData };
```

`PageBlock` is a **discriminated union**. TypeScript can narrow the type based on which key is present: inside an `if ('block' in item)` block, TypeScript knows `item.block` exists and is a `HeroBlockData`. Inside `if ('faq_section' in item)`, `item.faq_section` is a `FaqSectionBlockData`. No casts needed.

When you add a new block variant, extend the union with another member. That forces every dispatcher site to be updated (via exhaustiveness checks) — a compile-time safety net.

## The Angular side: the dispatcher pattern

The page component iterates `blocks` and dispatches each item to its matching block component:

```html
<!-- src/app/components/page/page.component.html -->
@for (item of p.blocks ?? []; track $index) {
  @if ('block' in item) {
    <app-hero-block [block]="item.block" />
  } @else if ('faq_section' in item) {
    <app-faq-section-block [data]="item.faq_section" />
  }
}
```

Each branch handles one variant. The dispatcher knows the list of variants but nothing about their internals — each block component owns its own rendering logic.

Why a `track $index` here instead of `track item.uid`? Blocks inside a modular blocks field don't have their own UIDs (they're not entries, just embedded data). Index is the best we've got. If block order never changes within a page this is fine; if ordering changes frequently you'd need to think harder about identity.

## Block components — thin adapters, then dumb presentational

Look at `FaqSectionBlockComponent`:

```ts
@Component({
  selector: 'app-faq-section-block',
  standalone: true,
  imports: [FaqListComponent],
  template: `
    <app-faq-list
      [heading]="section()?.title ?? ''"
      [subtitle]="section()?.subtitle ?? ''"
      [faqs]="section()?.faqs ?? []"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqSectionBlockComponent {
  readonly data = input.required<FaqSectionBlockData>();
  readonly section = computed(() => this.data().section[0]);
}
```

This component has one job: **adapt the CMS data shape into the inputs that `FaqListComponent` expects**. It unwraps the single-element reference array, pulls out the heading/subtitle/FAQ list, and hands them to the presentational component. No templates, no logic beyond the adapter.

This is the same three-layer pattern we used for the `/faq` route:

```
PageComponent                      ← smart (receives resolved page data)
  └─ FaqSectionBlockComponent      ← adapter (CMS shape → component inputs)
      └─ FaqListComponent          ← presentational (heading, subtitle, faqs)
          └─ FaqContentStackConnectorComponent   ← adapter (Faq → question/answer)
              └─ FaqItemComponent  ← presentational (question, answer)
```

Each layer has a single responsibility. Any layer can be changed (different CMS shape? different display?) without touching the ones above or below.

## Why split `FaqListComponent` out of `FaqPageComponent`?

Before this tutorial, `FaqPageComponent` did two things: provide page-level chrome (max-width container, padding, hardcoded heading) *and* render the list of FAQs. For the new block context we needed the list without the page chrome. Rather than bolt conditional logic into `FaqPageComponent`, we factored out `FaqListComponent`:

- `FaqListComponent` — pure list with signal inputs for heading, subtitle, and FAQs. No page chrome.
- `FaqPageComponent` — thin wrapper providing the chrome + default heading; delegates list rendering to `FaqListComponent`.

The `/faq` route still works unchanged. The block dispatcher uses `FaqListComponent` directly (via `FaqSectionBlockComponent`) and supplies the CMS-provided heading/subtitle.

This is a recurring pattern: when a component grows a second use case, factor out the reusable core and keep the original as a thin wrapper for the first use case.

## Adding a new block variant — the full checklist

Suppose you want to add a `testimonial_carousel` block variant. Here's everything that changes:

1. **ContentStack**: open the `page` content type, add a new variant to the `blocks` modular field with UID `testimonial_carousel`, define its fields (possibly with a reference to a top-level `testimonial` content type).
2. **TypeScript types**: add `TestimonialCarouselBlockData`, extend the `PageBlock` union.
3. **Service**: if the new variant has references, add them to the `.includeReference(...)` list.
4. **Angular**: create `TestimonialCarouselBlockComponent` (adapter) and whatever presentational components it needs.
5. **Dispatcher**: add an `@else if ('testimonial_carousel' in item)` branch in `page.component.html` and import the new component.

Nothing else changes. The page component, routes, resolver, and existing block components stay untouched.

## Trade-offs to know about

**Block model vs rich text**: A modular block model is structured — every block has a known schema, a dedicated component, and you can style each variant perfectly. But it's more work to design than a single "rich text body" field. Use a block model when the content has recurring, identifiable patterns (hero, FAQ, testimonial). Use rich text for prose where structure isn't important.

**Flexibility vs consistency**: Editors with many block variants and free placement can make pages look wildly different. That's a feature (marketing agility) or a bug (brand inconsistency) depending on whose point of view you take. Some teams restrict which block variants can appear on which content types, or enforce layout rules.

**Performance**: Each block variant resolved from references adds to the page payload. If a block aggregates dozens of referenced entries, watch the response size. Paginating or limiting references is available via query options.

## Further reading

- ContentStack documentation: "Modular Blocks" field type
- Angular documentation: "Built-in control flow" (`@for`, `@if`, `@else if`)
- TypeScript handbook: "Discriminated Unions"
