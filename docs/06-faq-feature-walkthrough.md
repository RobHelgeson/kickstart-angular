# FAQ Feature — End-to-End Walkthrough

This doc walks through the complete setup for the `/faq` feature, from creating the content type in ContentStack to seeing data render in the browser.

Prerequisite: the app is already configured with a `.env` file and running locally (see the project `README.md`).

---

## Step 1 — Create the `faq` content type in the ContentStack console

1. Log into your ContentStack organization and open your stack.
2. In the left sidebar, go to **Content Models**.
3. Click **+ New Content Type**.
4. Fill in:
   - **Name**: `FAQ`
   - **UID**: `faq` (auto-filled from the name — confirm this is lowercase)
   - **Content Type**: select **Multiple** (allows many FAQ entries)
5. Click **Create and Add Fields**.

<screenshot: the "New Content Type" dialog with Name="FAQ", UID="faq", and "Multiple" selected>

### Add the fields

Click **+ Insert a field** (or drag from the field type palette) for each field below.

**Field 1 — Question (Title)**

The `title` field is already present by default. Click its edit icon (pencil):
- Change the display name to **Question**
- Leave the UID as `title`
- Mark as Required ✅
- Save the field

<screenshot: the title field settings panel with display name changed to "Question">

**Field 2 — Answer**

- Choose field type: **Multi Line Textbox**
- Display name: `Answer`
- UID: `answer` (confirm)
- Mark as Required ✅
- Save the field

**Field 3 — Display Order**

- Choose field type: **Number**
- Display name: `Display Order`
- UID: `display_order` (confirm — the underscore matters, it must match `types.ts`)
- Mark as Required ✅
- Save the field

6. Click **Save** to save the content type.

---

## Step 2 — Seed 3–4 FAQ entries

1. In the left sidebar, go to **Entries**.
2. In the content type dropdown (top left of the entries list), select **FAQ**.
3. Click **+ New Entry** and fill in:

| Question | Answer | Display Order |
|---|---|---|
| What is ContentStack? | ContentStack is a headless CMS that delivers content via API to any frontend. | 10 |
| How do I preview content? | Edits in the console appear live in the preview pane when preview mode is on. | 20 |
| Where do I find my API keys? | In the stack sidebar under Settings → Tokens. | 30 |

4. After filling in each entry, click **Save & Publish**. Choose the environment that matches `NG_APP_CONTENTSTACK_ENVIRONMENT` in your `.env` file (typically `preview` for local development).

<screenshot: a saved and published FAQ entry in the entries list, showing the green "Published" status badge>

> **Important:** Only published entries are returned by the Delivery API. If you save without publishing, the entry won't appear in the app.

---

## Step 3 — Export the content type schema and commit it

From the repo root:

```bash
csdx auth:login   # skip if already authenticated

csdx cm:stacks:export \
  --stack-api-key <your-stack-api-key> \
  --data-dir ./contentstack-export \
  --module content-types
```

Move the exported schema into the repo:

```bash
cp ./contentstack-export/content_types/faq.json ./contentstack/content-types/faq.json
rm -rf ./contentstack-export
```

Commit it:

```bash
git add contentstack/content-types/faq.json
git commit -m "Add faq content type schema"
```

This file is now version-controlled. A teammate can recreate the same content type on a different stack by importing it.

---

## Step 4 — Verify the Angular app

The dev server should already be running (`npm run start`). If not, start it now.

Navigate to `http://localhost:4200/faq`.

You should see:

- An "FAQ" page heading
- Each published FAQ entry rendered as a question + answer, sorted by Display Order

<screenshot: the browser at /faq showing the three FAQ entries>

### Sanity checks

**FAQs appear but in wrong order**: Verify each entry has a unique, correct `display_order` number. The field UID must be exactly `display_order` (with underscore).

**"No FAQs published yet" appears**: Check that entries are published to the correct environment (the one in `.env`). Also confirm the content type UID is `faq` (not `faqs` or `FAQ`).

**Navigation to `/faq` redirects to `/`**: The route is not registered. Verify `src/main.ts` has the `faq` route entry with the resolver before the `**` catch-all.

**Browser console shows 422 or 401 error**: The API key or delivery token may not be set correctly in `.env`.

---

## Step 5 — Test sorting

In the ContentStack console, create a new entry:

- **Question**: "Is there a free plan?"
- **Answer**: "Yes, ContentStack offers a free developer tier."
- **Display Order**: `15`

Publish it, then hard-refresh the browser at `/faq`. The new entry should appear between "What is ContentStack?" (10) and "How do I preview content?" (20).

---

## What you've built

By completing this walkthrough you have:

- Created a custom content type from scratch with typed fields
- Seeded entries and controlled their publish state
- Exported the schema to Git for reproducibility
- Wired up an Angular route resolver that pre-fetches content
- Rendered a list of CMS-driven entries using signal inputs and OnPush change detection

The next tutorials will add: rich text rendering, visual builder edit tags, and live preview refresh without a page reload.
