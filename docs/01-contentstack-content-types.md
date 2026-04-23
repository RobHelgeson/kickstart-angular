# ContentStack Content Types

This doc covers what a content type is and the decisions you make when creating one. It references the `faq` content type built in this tutorial.

## What is a content type?

A **content type** is a schema — it defines the structure of a piece of content. Think of it as a database table definition, or a TypeScript interface for your CMS data. The content type says "an FAQ has a question, an answer, and a display order." Individual pieces of content created from that schema are called **entries**.

## UIDs vs display names

Every content type and every field has two names:

- **Display name** — what editors see in the console (e.g. "Question")
- **UID** — what the API uses (e.g. `title`)

UIDs are auto-derived from the display name when you first type it. They are **immutable after the content type is saved** — changing the UID would break every query in your code that references it. Display names can change freely.

When you create a field, immediately verify the UID. It's the name you'll reference in `getFaqs()`, TypeScript interfaces, and any query predicates.

## The mandatory `title` field

Every ContentStack content type has a `title` field with UID `title` by default. You can disable it via advanced settings, but the platform's search, list views, and URL generation all rely on it. The practical choice in most cases is to keep it and reuse it.

For the FAQ content type, we rename the `title` field's **display name** to "Question" so editors know what to type. The UID stays `title`. The API call and the TypeScript interface both use `title`, and the field holds the question text.

## Field types used in this tutorial

| Type | Use case | Notes |
|---|---|---|
| Single Line Textbox | Short strings: titles, names, labels | Max 255 characters |
| Multi Line Textbox | Longer plain text: answers, descriptions | No formatting |
| Number | Integers or decimals for ordering, counts | We use it for `display_order` |

ContentStack has many more field types (Rich Text, Date, Boolean, Modular Blocks, Reference, etc.) that will appear in later tutorials.

## Single vs Multiple content type

When you create a content type you choose:

- **Single** — only one entry can exist (e.g. a global "Site Settings" singleton)
- **Multiple** — any number of entries can exist (e.g. blog posts, FAQs, products)

FAQ is **Multiple** because there are many individual FAQ entries.

## Publishing and environments

ContentStack uses a publish/environment model to control which content your app sees:

1. You create an entry (it exists in a "draft" state)
2. You publish it to an **environment** (e.g. `preview`, `production`)
3. The Delivery API only returns entries that have been published to the environment your app is configured for

Your app's active environment is set via `NG_APP_CONTENTSTACK_ENVIRONMENT` in `.env` (which feeds into `environment.contentstack.environment`). If a newly created FAQ entry doesn't appear at `/faq`, the most likely cause is that it hasn't been published to the correct environment.

## The FAQ content type schema

Fields in order:

| Display name | UID | Type | Required |
|---|---|---|---|
| Question | `title` | Single Line Textbox | ✅ |
| Answer | `answer` | Multi Line Textbox | ✅ |
| Display Order | `display_order` | Number | ✅ |

The TypeScript interface in `types.ts` mirrors these UIDs exactly:

```ts
export interface Faq {
  uid: string;           // system field, always present
  _version?: number;     // system field, incremented on each save
  title: string;         // the question
  answer: string;
  display_order: number;
}
```

## Further reading

- ContentStack documentation: "Content Types" guide
- ContentStack documentation: "Fields" reference (covers all available field types)
