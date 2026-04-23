> Note that this project is not an official Contentstack maintained repo yet. This is a work in progress and will be updated over time. When it is finished enough it will move to the official Contentstack Github home.
>
> This version was copied from the original content stack, and Rob Helgeson has extended it for ATD tutorial use.

# Contentstack Kickstart: Angular 18

This is a kickstart example to connect Angular to Contentstack.
This example covers the following items:

- SDK initialization
- Live preview and Visual building setup

More details about this codebase can be found on the [Contentstack docs](https://www.contentstack.com/docs/developers).

[![Join us on Discord](https://img.shields.io/badge/Join%20Our%20Discord-7289da.svg?style=flat&logo=discord&logoColor=%23fff)](https://community.contentstack.com)

## Learning path

If you're using this repo to learn ContentStack + Angular, start here: **[docs/README.md](./docs/README.md)**

The `docs/` folder walks through every concept in this codebase — content types, the CLI, service patterns, route resolvers, and component architecture — with explanations aimed at developers who are new to one or both platforms.

## How to get started

Before you can run this code, you will need a Contentstack "Stack" to connect to.
Follow the following steps to seed a Stack that this codebase understands.

> If you installed this Kickstart via the Contentstack Marketplace or the new account onboarding, you can skip this step.

### Install the CLI

```bash
npm install -g @contentstack/cli
```

#### Using the CLI for the first time?

It might ask you to set your default region.
You can get all regions and their codes [here](https://www.contentstack.com/docs/developers/cli/configure-regions-in-the-cli) or run `csdx config:get:region`.

> Beware, Free Contentstack developer accounts are bound to the EU region. We still use the CDN the API is lightning fast.

Set your region like so:

```bash
csdx config:set:region EU
```

### Log in via the CLI

```bash
csdx auth:login
```

### Get your organization UID

In your Contentstack Organization dashboard find `Org admin` and copy your Organization ID (Example: `blt481c598b0d8352d9`).

### Create a new stack

Make sure to replace `<YOUR_ORG_ID>` with your actual Organization ID and run the below.

```bash
csdx cm:stacks:seed --repo "contentstack/kickstart-stack-seed" --org "<YOUR_ORG_ID>" -n "Kickstart Stack"
```

### Create a new delivery token

Go to Settings > Tokens and create a delivery token. Select the `preview` scope and turn on `Create preview token`

> In the case of Angular 18, check the settings in the environment and make sure the url is: `http://localhost:4200/` instead of `http://localhost:3000/`

### Configure your environment variables

This project uses environment variables to keep API keys secure and out of version control.

1. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill out the `.env` file with your actual values:

   ```env
   NG_APP_CONTENTSTACK_API_KEY=<YOUR_API_KEY>
   NG_APP_CONTENTSTACK_DELIVERY_TOKEN=<YOUR_DELIVERY_TOKEN>
   NG_APP_CONTENTSTACK_PREVIEW_TOKEN=<YOUR_PREVIEW_TOKEN>
   NG_APP_CONTENTSTACK_ENVIRONMENT=preview
   NG_APP_CONTENTSTACK_REGION=EU
   NG_APP_CONTENTSTACK_PREVIEW=true
   ```

The environment files (`src/environments/environment.ts` and `src/environments/environment.production.ts`) are automatically generated from your `.env` file when you run `npm start` or `npm run build`.

> **Important:** Never commit the `.env` file to your repository. It's already included in `.gitignore` to prevent accidental commits of your API keys.

### Turn on Live Preview

Go to Settings > Live Preview. Click enable and select the `Preview` environment in the drop down. Hit save.

### Install the dependencies

```bash
npm install
```

### Run your app

```bash
npm run start
```

### See your page visually

### In the browser

Go to `http://localhost:4200/`.

#### In the CMS

Go to Entries and select the only entry in the list.
In the sidebar, click on the live preview icon.
Or, click on visual experience in the sidebar.
