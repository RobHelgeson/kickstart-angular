#!/usr/bin/env node

const { getContentstackEndpoints, getRegionForString } = require('@timbenniks/contentstack-endpoints');

const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  // Development: read from .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
} else {
  // Production: read from process.env
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NG_APP_CONTENTSTACK_')) {
      envVars[key] = process.env[key];
    }
  });
}

const region = getRegionForString(envVars.NG_APP_CONTENTSTACK_REGION);
const endpoints = getContentstackEndpoints(region, true);

// Generate environment.ts content
const environmentContent = `export const environment = {
  production: false,
  contentstack: {
    apiKey: '${envVars.NG_APP_CONTENTSTACK_API_KEY || ''}',
    deliveryToken: '${envVars.NG_APP_CONTENTSTACK_DELIVERY_TOKEN || ''}',
    previewToken: '${envVars.NG_APP_CONTENTSTACK_PREVIEW_TOKEN || ''}',
    environment: '${envVars.NG_APP_CONTENTSTACK_ENVIRONMENT || 'preview'}',
    region: '${region ? region : envVars.NG_APP_CONTENTSTACK_REGION}',
    preview: ${envVars.NG_APP_CONTENTSTACK_PREVIEW === 'true'},

    contentDelivery: '${envVars.NG_APP_CONTENTSTACK_CONTENT_DELIVERY || (endpoints && endpoints.contentDelivery)}',
    previewHost: '${envVars.NG_APP_CONTENTSTACK_PREVIEW_HOST || (endpoints && endpoints.preview)}',
    applicationHost: '${envVars.NG_APP_CONTENTSTACK_CONTENT_APPLICATION || (endpoints && endpoints.application)}'
  }
};
`;

// Generate environment.production.ts content
const environmentProdContent = `export const environment = {
  production: true,
  contentstack: {
    apiKey: '${envVars.NG_APP_CONTENTSTACK_API_KEY || ''}',
    deliveryToken: '${envVars.NG_APP_CONTENTSTACK_DELIVERY_TOKEN || ''}',
    previewToken: '${envVars.NG_APP_CONTENTSTACK_PREVIEW_TOKEN || ''}',
    environment: '${envVars.NG_APP_CONTENTSTACK_ENVIRONMENT || 'preview'}',
    region: '${region ? region : envVars.NG_APP_CONTENTSTACK_REGION}',
    preview: ${envVars.NG_APP_CONTENTSTACK_PREVIEW === 'true'},

    contentDelivery: '${envVars.NG_APP_CONTENTSTACK_CONTENT_DELIVERY || (endpoints && endpoints.contentDelivery)}',
    previewHost: '${envVars.NG_APP_CONTENTSTACK_PREVIEW_HOST || (endpoints && endpoints.preview)}',
    applicationHost: '${envVars.NG_APP_CONTENTSTACK_CONTENT_APPLICATION || (endpoints && endpoints.application)}'

  }
};
`;

// Write the files
fs.writeFileSync(path.join(__dirname, 'src/environments/environment.ts'), environmentContent);
fs.writeFileSync(path.join(__dirname, 'src/environments/environment.production.ts'), environmentProdContent);

console.log('Environment files generated successfully!');
