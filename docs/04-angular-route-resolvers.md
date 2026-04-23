# Angular Route Resolvers

This doc explains what a route resolver does and how the `faqResolver` in this app works. File: `src/app/resolvers/faq.resolver.ts`.

## What problem does a resolver solve?

Without a resolver, you fetch data inside the component — typically in `ngOnInit`. That means the component mounts first, renders in an empty or loading state, then re-renders when the data arrives. This works, but it adds a loading state to manage and a visual jump for the user.

A resolver runs **before** the route activates. The router fetches the data, waits for it, and only then instantiates and renders the component. The component always receives its data on first render — no loading state needed.

Trade-off: navigation appears to "pause" slightly while the resolver runs. For fast API calls on a good connection this is imperceptible. For slow connections you may want to show a navigation progress indicator instead of a true loading state.

## The functional `ResolveFn` form

Angular 15+ introduced functional resolvers to replace the older class-based pattern. The current best practice in Angular 21:

```ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Faq } from '../../../types';
import { ContentstackService } from '../services/contentstack.service';

export const faqResolver: ResolveFn<Faq[]> = () =>
  inject(ContentstackService).getFaqs();
```

`ResolveFn<T>` is a type alias for a function `(route, state) => T | Observable<T> | Promise<T>`. Here we ignore `route` and `state` since we don't need them — we just want all FAQs.

`inject()` works inside a resolver function because resolvers execute in Angular's injection context. There's no class to wire up, no `@Injectable`, no constructor.

## Registering the resolver on a route

In `src/main.ts`:

```ts
const routes = [
  { path: '', component: HomeComponent },
  { path: 'faq', component: FaqPageComponent, resolve: { faqs: faqResolver } },
  { path: '**', redirectTo: '' }
];
```

The `resolve` property is a dictionary. The key (`faqs`) is the name you'll use to read the data back out. The value is the resolver function.

## Reading resolved data in the component

```ts
export class FaqPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly faqs = signal<Faq[]>(
    (this.route.snapshot.data['faqs'] as Faq[]) ?? []
  );
}
```

`route.snapshot.data['faqs']` gives you the value the resolver returned. The key `'faqs'` matches the key in the route's `resolve` config. We read it once in the constructor and store it in a signal so the template can read it reactively.

The `?? []` is a fallback — `as Faq[]` tells TypeScript what type to expect, but it doesn't guarantee the value at runtime. A `[]` fallback means the empty state is handled gracefully if something unexpected happens.

## What happens if the resolver fails?

If `getFaqs()` returns an Observable that errors (e.g. network failure, wrong API key), Angular cancels the navigation and the `/faq` route does not activate. In practice this means a silent failure. Error handling in resolvers is covered in a future tutorial — for now, this is an acceptable trade-off for simplicity.

## Further reading

- Angular documentation: "Route resolvers" (search "Resolve guard" or "ResolveFn")
- Angular documentation: `ActivatedRoute` API reference
