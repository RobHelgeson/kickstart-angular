# ContentStack Content Type Schemas

JSON schema files exported from ContentStack live here. Each file corresponds to one content type and can be used to recreate that content type on another stack via the CLI.

## How to import

```bash
csdx cm:stacks:import \
  --stack-api-key <target-stack-api-key> \
  --data-dir ./contentstack \
  --module content-types
```

## How to export (update these files after changing a content type)

```bash
csdx cm:stacks:export \
  --stack-api-key <your-stack-api-key> \
  --data-dir ./contentstack-export \
  --module content-types

cp ./contentstack-export/content_types/faq.json ./contentstack/content-types/faq.json
rm -rf ./contentstack-export
```

## Files

| File | Content type UID | Description |
| --- | --- | --- |
| `faq.json` | `faq` | FAQ entries — question, answer, display order |
