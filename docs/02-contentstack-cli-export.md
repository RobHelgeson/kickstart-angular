# ContentStack CLI — Exporting Schemas

This doc covers the `csdx` CLI tool and why exporting your content type schemas into Git is a worthwhile habit.

## What is `csdx`?

`csdx` is ContentStack's official command-line tool. You can use it to:

- Seed a stack with starter content and content types
- Export/import content types, entries, and assets between stacks
- Manage environments, tokens, and users
- Automate stack setup in CI/CD

Install it globally if you haven't already:

```bash
npm install -g @contentstack/cli
```

Confirm the installed version:

```bash
csdx --version
```

## Authenticating

```bash
csdx auth:login
```

This opens a browser for OAuth. Once authenticated, your credentials are stored locally and reused across sessions.

If your stack is in a non-default region (e.g. EU), set the region first:

```bash
csdx config:set:region EU
```

Run `csdx config:get:region` to see the currently configured region.

## Finding your stack API key

In the ContentStack console: **Settings → Stack** (or look in the sidebar). The API key looks like `blt481c598b0d8352d9`.

## Exporting the FAQ content type schema

```bash
csdx cm:stacks:export \
  --stack-api-key <your-stack-api-key> \
  --data-dir ./contentstack-export \
  --module content-types
```

This writes JSON files for every content type to `./contentstack-export/content_types/`. Find `faq.json` and move it:

```bash
cp ./contentstack-export/content_types/faq.json ./contentstack/content-types/faq.json
rm -rf ./contentstack-export
```

The file at `contentstack/content-types/faq.json` is what we commit to Git.

> If the export flags differ for your version of `csdx`, run `csdx cm:stacks:export --help` to see the current options.

## Why export schemas to Git?

A content type defined only in the ContentStack console is invisible to anyone cloning your repo. Exporting and committing the schema means:

1. **Reproducibility** — a teammate (or future you) can recreate the exact content type on a new stack with `csdx cm:stacks:import`
2. **Code review** — content model changes go through the same PR process as code changes
3. **Documentation** — the JSON file is an authoritative record of what fields exist and what type they are

The schema JSON is also what you'd use if you were migrating stacks or spinning up a staging environment with matching content types.

## Importing a schema (future reference)

```bash
csdx cm:stacks:import \
  --stack-api-key <target-stack-api-key> \
  --data-dir ./contentstack \
  --module content-types
```

This is covered in more detail in a future tutorial.

## Further reading

- ContentStack documentation: "CLI" reference
- ContentStack documentation: "Import/Export" guide
