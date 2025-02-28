// Custom commands for Cypress tests

// Example command to select an answer in the quiz
Cypress.Commands.add('selectAnswer', (index: number) => {
  cy.get('.btn.btn-primary').eq(index).click();
});

// Add TypeScript definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select an answer in the quiz
       * @param index - The index of the answer to select
       * @example cy.selectAnswer(0)
       */
      selectAnswer(index: number): Chainable<Element>;
    }
  }
}

// This is required to make the file a module
export {};