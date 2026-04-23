# Angular Smart/Dumb Components

This doc explains the component design behind the FAQ feature and the Angular 21 patterns used. Files: `src/app/components/faq-page/`, `src/app/components/faq-item/`.

## Smart vs dumb components

A common Angular pattern is to separate components by responsibility:

| | Smart (container) | Dumb (presentational) |
|---|---|---|
| Also called | Container, host, page | Presentational, item, leaf |
| Knows about | Routes, services, resolvers | Nothing outside itself |
| Receives data | From router or service | Via inputs from parent |
| Example | `FaqPageComponent` | `FaqItemComponent` |

**Why bother?** A dumb component is reusable and testable in isolation. You can render `<app-faq-item [faq]="someFaq" />` anywhere without worrying about routing or service injection. A smart component can be as messy as it needs to be — it's the one place that wires everything together.

In this feature:

- `FaqPageComponent` is smart: it reads the resolver's data from `ActivatedRoute` and owns the `faqs` signal.
- `FaqItemComponent` is dumb: it receives one `Faq` object and renders it. It has no knowledge of Angular routing, ContentStack, or how the data was fetched.

## Signal-based inputs: `input.required<T>()`

Angular 17 introduced signal-based inputs as a replacement for the `@Input()` decorator:

```ts
// Old way (still valid, but not idiomatic in Angular 17+)
@Input() faq!: Faq;

// New way
readonly faq = input.required<Faq>();
```

`input.required<Faq>()` creates a signal that holds the input value. Two improvements over `@Input()`:

1. **Compile-time enforcement** — if you use `<app-faq-item />` without a `[faq]` binding, TypeScript reports an error at build time, not a runtime crash.
2. **Signal semantics** — you read the value in templates and code with `faq()` (call syntax), exactly like any other signal. Angular can track dependencies without zone.js.

## Reading signal inputs in templates

```html
<h2>{{ faq().title }}</h2>
<p>{{ faq().answer }}</p>
```

Note the `()` — you call the signal as a function to read its current value. This is the same syntax as `signal<T>()` state in other components.

## `ChangeDetectionStrategy.OnPush`

Both components use `ChangeDetectionStrategy.OnPush`:

```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

By default, Angular checks every component on every event (click, timer, API response). `OnPush` tells Angular: only re-check this component when one of its inputs changes, an event originates inside it, or a signal it reads changes.

Combined with signal inputs, this is almost free performance: Angular only re-renders `FaqItemComponent` when its `faq` signal emits a new value. For a list component that renders many items, this matters.

## Built-in control flow: `@for` and `@if`

Angular 17 replaced `*ngIf` and `*ngFor` directives with built-in template control flow syntax:

```html
@if (faqs().length === 0) {
  <p>No FAQs published yet.</p>
} @else {
  @for (faq of faqs(); track faq.uid) {
    <app-faq-item [faq]="faq" />
  }
}
```

`@if` / `@else` replaces `*ngIf` / `ng-template`. `@for` replaces `*ngFor`. The `track` expression (required in `@for`) tells Angular what to use as a unique key for each item — this is used to reuse DOM elements when the list changes, rather than destroying and recreating them. ContentStack entry UIDs are perfect track keys.

## Standalone components

All components in this repo use `standalone: true`. This means they declare their own `imports` array instead of belonging to a module:

```ts
@Component({
  standalone: true,
  imports: [FaqItemComponent],  // FaqPageComponent uses FaqItemComponent in its template
  ...
})
```

If you try to use a component in a template without importing it here, Angular reports a compile-time error.

## Further reading

- Angular documentation: "Signals" overview
- Angular documentation: `input` API reference
- Angular documentation: "Built-in control flow" (`@if`, `@for`)
- Angular documentation: "Standalone components"
- Angular documentation: `ChangeDetectionStrategy`
