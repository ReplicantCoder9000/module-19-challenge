// Import commands.ts using ES modules syntax
import './commands';

// Import mount function from Cypress React module
import { mount } from 'cypress/react';

// Add mount command to the global Cypress namespace
Cypress.Commands.add('mount', mount);

// Add TypeScript definitions for the mount command
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mount a React component in tests
       * @param component - The React component to mount
       * @param options - The options to pass to the mount function
       * @example cy.mount(<MyComponent />)
       */
      mount: typeof mount;
    }
  }
}

// This is required to make the file a module
export {};