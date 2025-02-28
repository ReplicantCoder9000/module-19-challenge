import { defineConfig } from 'cypress';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import react from '@vitejs/plugin-react';

// ES modules don't have __dirname, so we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        plugins: [react()],
      },
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  e2e: {
    // Use a dummy URL since we're stubbing all responses
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
    // Skip server verification
    experimentalSkipDomainInjection: ['*'],
  },
  video: false,
  screenshotOnRunFailure: true,
});