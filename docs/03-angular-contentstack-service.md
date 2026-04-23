# Angular ContentStack Service

This doc explains how the ContentStack SDK is initialized and used in this app. File: `src/app/services/contentstack.service.ts`.

## How the client is configured

The SDK client (called a "stack") is initialized once in the `ContentstackService` constructor:

```ts
this.stack = contentstack.default.stack({
  apiKey: config.apiKey,
  deliveryToken: config.deliveryToken,
  environment: config.environment,
  region: config.region as Region,
  host: config.contentDelivery,
  live_preview: { ... }
})
```

All configuration values come from `environment.contentstack`, which is generated from your `.env` file at startup by `generate-env.js`. The pattern keeps credentials out of source control.

`@Injectable({ providedIn: 'root' })` means Angular creates exactly one instance of this service for the whole application. The SDK client is initialized once and shared.

## The query builder pattern

Every content fetch follows the same shape:

```ts
this.stack
  .contentType('content-type-uid')   // which content type
  .entry()                           // targeting entries (not assets)
  .query()                           // opens the query builder
  .where(...)                        // optional: filter entries
  .orderByAscending(...)             // optional: sort results
  .find<T>()                         // execute the query, returns a Promise
```

`.find<T>()` is generic — the `T` is a TypeScript hint for what shape the entries will have. It returns a Promise that resolves to an object with shape `{ entries: T[], count?: number, ... }`.

## `getEntryByUrl` — fetching a single entry by URL

The existing method finds one entry whose `url` field matches a given value:

```ts
getEntryByUrl(contentType: string, url: string): Observable<any> {
  return from(
    this.stack
      .contentType(contentType)
      .entry()
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find<Page>()
      .then((result: any) => result.entries[0])  // take the first (only) match
  );
}
```

`QueryOperation.EQUALS` is an enum from the SDK. There are others: `INCLUDES`, `NOT_EQUALS`, `GREATER_THAN`, etc.

## `getFaqs` — fetching all entries sorted by a field

The new method fetches every published FAQ entry, sorted:

```ts
getFaqs(): Observable<Faq[]> {
  return from(
    this.stack
      .contentType('faq')
      .entry()
      .query()
      .orderByAscending('display_order')
      .find<Faq>()
      .then((result: any) => result.entries as Faq[])
  );
}
```

Two differences from `getEntryByUrl`:

1. **No `.where(...)` predicate** — we want all published entries of this type, not a filtered subset.
2. **`.orderByAscending('display_order')`** — the API returns entries sorted by the named field, ascending. ContentStack also has `.orderByDescending()`. Without either, the order is unspecified.

The `then` callback unwraps the `entries` array from the response object, since callers just want a flat `Faq[]`.

## Why `from(promise)`?

The ContentStack SDK returns native Promises. Angular's router and the rest of the app work with Observables (from RxJS). `from(promise)` wraps a Promise in an Observable that emits the resolved value once and then completes.

This is the standard bridge pattern. It doesn't change the behavior — it's purely a type adapter.

## Further reading

- ContentStack documentation: "JavaScript Delivery SDK" reference
- Angular documentation: "Services and dependency injection"
- RxJS documentation: `from` operator
