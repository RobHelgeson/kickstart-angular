# Learning Path — ContentStack + Angular

This folder documents the concepts behind the code in this repo. The docs are written for an Angular developer who is new to ContentStack, or a ContentStack user who is new to Angular 21+. They assume working TypeScript knowledge but do not assume experience with either platform.

Read them in order the first time through. Later, use them as reference.

## Reading order

| Doc | What it covers |
| --- | --- |
| [01 — ContentStack Content Types](./01-contentstack-content-types.md) | What a content type is, UIDs vs display names, field types, Single vs Multiple, publishing model |
| [02 — ContentStack CLI Export](./02-contentstack-cli-export.md) | The `csdx` tool, authenticating, exporting schemas to Git, why this matters for teams |
| [03 — Angular ContentStack Service](./03-angular-contentstack-service.md) | How the SDK client is configured in this app, the query builder pattern, sorting, Promise→Observable |
| [04 — Angular Route Resolvers](./04-angular-route-resolvers.md) | What a resolver does, the functional `ResolveFn` form, how resolved data flows into components |
| [05 — Angular Smart/Dumb Components](./05-angular-smart-dumb-components.md) | Container vs presentational split, signal inputs, OnPush change detection, `@for`/`@if` control flow |
| [06 — FAQ Feature Walkthrough](./06-faq-feature-walkthrough.md) | End-to-end guide: create the content type, seed entries, navigate to `/faq` |

## What this feature demonstrates

The `/faq` route in this app is a minimal but complete slice that shows:

1. A custom ContentStack content type with typed fields and sort order
2. A route that pre-fetches data before the component mounts (via a resolver)
3. A smart host page that owns the data and a dumb item component that displays it
4. Angular 21 patterns: signal-based inputs, `OnPush`, built-in control flow

Future tutorials will layer on rich text rendering, visual builder edit tags, and live preview refresh.
