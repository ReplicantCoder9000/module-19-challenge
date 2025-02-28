# Cypress Testing Implementation Plan for Tech Quiz Application

## Overview

This document outlines the plan for implementing Cypress testing for the Tech Quiz application. The application is a MERN stack app with a React frontend, MongoDB database, and Node.js/Express.js server. It allows users to take a quiz of ten random questions and view their final score.

## Current Application Structure

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with MongoDB
- **Main Component**: Quiz.tsx handles quiz state, question display, and user interactions

## Implementation Requirements

1. Configure Cypress for both component and end-to-end testing
2. Create a component test for the quiz component
3. Create an end-to-end test for the quiz component

## Detailed Implementation Steps

### 1. Configure Cypress for Component and E2E Testing

- Create a `cypress.config.ts` file in the root directory with:
  - Component testing configuration for React + Vite
  - E2E testing configuration for the full application
  - Proper TypeScript support

Here's the detailed configuration we'll implement:

```typescript
import { defineConfig } from 'cypress';
import { devServer } from '@cypress/vite-dev-server';
import { resolve } from 'path';

export default defineConfig({
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: 'react',
        viteConfig: {
          configFile: resolve(__dirname, 'client/vite.config.ts'),
        },
      });
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  e2e: {
    baseUrl: 'http://localhost:3001',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  video: false,
  screenshotOnRunFailure: true,
});
```

- Set up the recommended directory structure:
  ```
  cypress/
  ├── component/          // Component tests
  │   └── Quiz.cy.tsx     // Tests for Quiz component
  ├── e2e/                // End-to-end tests
  │   └── quiz.cy.ts      // Full application flow tests
  ├── fixtures/           // Test data
  │   └── questions.json  // Mock question data
  └── tsconfig.json       // TypeScript configuration
  ```

### 2. Create Support Files and Test Fixtures

#### Support Files

We'll need to create the following support files:

```typescript
// cypress/support/component.ts
import './commands';
import { mount } from 'cypress/react';

// Augment the Cypress namespace to include the mount command
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);
```

```typescript
// cypress/support/e2e.ts
import './commands';
```

```typescript
// cypress/support/commands.ts
// Custom commands can be added here
// For example, a command to select an answer in the quiz:
Cypress.Commands.add('selectAnswer', (index) => {
  cy.get('.btn.btn-primary').eq(index).click();
});
```

#### TypeScript Configuration

```json
// cypress/tsconfig.json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["cypress", "node"],
    "isolatedModules": false
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

#### Test Fixtures

- Create `cypress/fixtures/questions.json` with mock question data that matches the application's Question interface:
  ```typescript
  interface Question {
    _id: string;
    question: string;
    answers: {
      text: string;
      isCorrect: boolean;
    }[];
  }
  ```

Here's a sample of the mock data we'll create:

```json
[
  {
    "_id": "1",
    "question": "What is React?",
    "answers": [
      {
        "text": "A JavaScript library for building user interfaces",
        "isCorrect": true
      },
      {
        "text": "A programming language",
        "isCorrect": false
      },
      {
        "text": "A database management system",
        "isCorrect": false
      },
      {
        "text": "A server-side framework",
        "isCorrect": false
      }
    ]
  },
  {
    "_id": "2",
    "question": "What does JSX stand for?",
    "answers": [
      {
        "text": "JavaScript XML",
        "isCorrect": true
      },
      {
        "text": "JavaScript Extension",
        "isCorrect": false
      },
      {
        "text": "JavaScript Syntax",
        "isCorrect": false
      },
      {
        "text": "JavaScript eXecution",
        "isCorrect": false
      }
    ]
  }
]
```

### 3. Create Component Tests for Quiz Component

Create `cypress/component/Quiz.cy.tsx` to test:

- Initial rendering with Start Quiz button
- Quiz loading state
- Question and answer display
- Answer selection functionality
- Score calculation
- Quiz completion state
- Restarting the quiz

Here's a detailed implementation of the component tests:

```typescript
// cypress/component/Quiz.cy.tsx
import Quiz from '../../client/src/components/Quiz';

describe('Quiz Component', () => {
  beforeEach(() => {
    // Load the fixture data
    cy.fixture('questions.json').as('questionsData');
  });

  it('should render the start button initially', () => {
    cy.mount(<Quiz />);
    cy.get('.btn.btn-primary').should('contain', 'Start Quiz');
  });

  it('should show loading state after clicking start', () => {
    // Intercept the API call but don't resolve it immediately
    cy.intercept('GET', '/api/questions/random', (req) => {
      req.on('response', (res) => {
        // Delay the response to show loading state
        res.setDelay(500);
      });
    }).as('getQuestions');

    cy.mount(<Quiz />);
    cy.get('.btn.btn-primary').click();
    cy.get('.spinner-border').should('be.visible');
  });

  it('should display questions after loading', () => {
    // Intercept the API call and return fixture data
    cy.intercept('GET', '/api/questions/random', { fixture: 'questions.json' }).as('getQuestions');

    cy.mount(<Quiz />);
    cy.get('.btn.btn-primary').click();
    cy.wait('@getQuestions');

    // Verify question is displayed
    cy.get('@questionsData').then((questions: any) => {
      cy.get('h2').should('contain', questions[0].question);
      
      // Verify all answers are displayed
      questions[0].answers.forEach((answer: any, index: number) => {
        cy.get('.alert.alert-secondary').eq(index).should('contain', answer.text);
      });
    });
  });

  it('should move to the next question after answering', () => {
    // Intercept the API call and return fixture data
    cy.intercept('GET', '/api/questions/random', { fixture: 'questions.json' }).as('getQuestions');

    cy.mount(<Quiz />);
    cy.get('.btn.btn-primary').click();
    cy.wait('@getQuestions');

    // Answer the first question
    cy.get('.btn.btn-primary').first().click();

    // Verify second question is displayed
    cy.get('@questionsData').then((questions: any) => {
      cy.get('h2').should('contain', questions[1].question);
    });
  });

  it('should calculate score correctly', () => {
    // Create a custom fixture with known correct answers
    const testQuestions = [
      {
        _id: '1',
        question: 'Question 1',
        answers: [
          { text: 'Correct Answer', isCorrect: true },
          { text: 'Wrong Answer', isCorrect: false }
        ]
      },
      {
        _id: '2',
        question: 'Question 2',
        answers: [
          { text: 'Wrong Answer', isCorrect: false },
          { text: 'Correct Answer', isCorrect: true }
        ]
      }
    ];

    // Intercept the API call and return custom data
    cy.intercept('GET', '/api/questions/random', testQuestions).as('getQuestions');

    cy.mount(<Quiz />);
    cy.get('.btn.btn-primary').click();
    cy.wait('@getQuestions');

    // Answer first question correctly
    cy.get('.btn.btn-primary').first().click();
    
    // Answer second question correctly
    cy.get('.btn.btn-primary').eq(1).click();

    // Verify score is 2/2
    cy.get('.alert.alert-success').should('contain', '2/2');
  });

  it('should show completion screen after answering all questions', () => {
    // Intercept the API call and return fixture data with only 2 questions
    cy.intercept('GET', '/api/questions/random', (req) => {
      req.reply({
        body: [
          {
            _id: '1',
            question: 'Question 1',
            answers: [
              { text: 'Answer 1', isCorrect: true },
              { text: 'Answer 2', isCorrect: false }
            ]
          },
          {
            _id: '2',
            question: 'Question 2',
            answers: [
              { text: 'Answer 1', isCorrect: false },
              { text: 'Answer 2', isCorrect: true }
            ]
          }
        ]
      });
    }).as('getQuestions');

    cy.mount(<Quiz />);
    cy.get('.btn.btn-primary').click();
    cy.wait('@getQuestions');

    // Answer both questions
    cy.get('.btn.btn-primary').first().click();
    cy.get('.btn.btn-primary').first().click();

    // Verify completion screen
    cy.get('h2').should('contain', 'Quiz Completed');
    cy.get('.btn.btn-primary').should('contain', 'Take New Quiz');
  });

  it('should restart the quiz when clicking Take New Quiz', () => {
    // Intercept the API call and return fixture data
    cy.intercept('GET', '/api/questions/random', { fixture: 'questions.json' }).as('getQuestions');

    cy.mount(<Quiz />);
    
    // Start quiz
    cy.get('.btn.btn-primary').click();
    cy.wait('@getQuestions');

    // Complete quiz (simplified for test)
    cy.window().then((win) => {
      // Access component state directly to force completion
      const quizComponent = win.document.querySelector('.App')._reactRootContainer._internalRoot.current.child.child.stateNode;
      quizComponent.setState({ quizCompleted: true });
    });

    // Verify completion screen and click restart
    cy.get('h2').should('contain', 'Quiz Completed');
    cy.get('.btn.btn-primary').click();
    
    // Verify new API call and reset state
    cy.wait('@getQuestions');
    cy.get('h2').should('not.contain', 'Quiz Completed');
  });
});
```

Key testing approaches:
- Mock the API response using Cypress intercept
- Test all component states
- Verify DOM elements and interactions

### 4. Create End-to-End Tests

Create `cypress/e2e/quiz.cy.ts` to test the full user flow:

- Visiting the application
- Starting the quiz
- Answering all questions
- Verifying score display
- Starting a new quiz

Key testing approaches:
- Test against the running application
- Mock API responses if needed for consistent testing
- Verify the complete user journey

### 5. Update package.json Scripts

Add or update scripts in the root `package.json`:
```json
"scripts": {
  "test": "cypress run",
  "test:open": "cypress open",
  "test:component": "cypress run --component",
  "test:e2e": "cypress run --e2e"
}
```

### 6. Documentation

Update README.md with:
- Testing setup instructions
- How to run tests
- Testing approach and coverage

## Technical Considerations

1. **API Mocking**:
   - Use Cypress intercept to mock API responses
   - Create consistent test data for reliable tests

2. **Component Testing**:
   - Mount the Quiz component in isolation
   - Test each state and interaction independently

3. **E2E Testing**:
   - Test the full application flow
   - Ensure the server is running during tests

4. **TypeScript Integration**:
   - Ensure proper TypeScript configuration for Cypress
   - Use type definitions for better test reliability

## Next Steps

After approval of this plan:
1. Implement the Cypress configuration
2. Create the test fixtures
3. Implement component tests
4. Implement E2E tests
5. Update documentation
6. Verify all tests pass