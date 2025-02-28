# Tech Quiz Application with Cypress Testing

A MERN stack application that allows users to take a quiz of ten random questions and view their final score.

## Features

- Start a tech quiz
- Answer multiple-choice questions
- View your final score
- Start a new quiz

## Technologies Used

- **Frontend**: React with TypeScript, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Testing**: Cypress for component and E2E testing

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Rename the `.env.EXAMPLE` file in the server directory to `.env` and configure your MongoDB connection string.
4. Seed the database:
   ```
   npm run seed
   ```

## Running the Application

Start the development server:
```
npm run start:dev
```

This will start both the backend server and the frontend application.

## Testing with Cypress

This application includes both component tests and end-to-end tests using Cypress.

### Running Tests

Run all tests (requires server to be running for E2E tests):
```
npm test
```

Open Cypress Test Runner:
```
npm run test:open
```

Run only component tests (doesn't require server):
```
npm run test:component
```

Run only end-to-end tests (requires server to be running):
```
npm run test:e2e
```

### Test Structure

- **Component Tests**: Test the Quiz component in isolation
  - Located in `cypress/component/Quiz.cy.tsx`
  - Tests rendering, user interactions, and state changes
  - All component tests are passing successfully

- **End-to-End Tests**: Test the full application flow
  - Located in `cypress/e2e/quiz.cy.ts`
  - Tests the complete user journey from start to finish
  - Requires the server to be running to execute

### Testing Approach

1. **Component Testing**:
   - Mount the Quiz component in isolation
   - Mock API responses using Cypress intercept
   - Test all component states (not started, loading, question display, completed)
   - Verify DOM elements and interactions
   - Tests include:
     - Initial rendering with Start Quiz button
     - Loading state after clicking start
     - Question and answer display
     - Moving to the next question after answering
     - Score calculation
     - Quiz completion screen
     - Restarting the quiz

2. **E2E Testing**:
   - Test against the running application
   - Mock API responses for consistent testing
   - Verify the complete user journey
   - Tests include:
     - Application loading
     - Starting the quiz
     - Answering questions
     - Viewing the final score
     - Starting a new quiz

### Running the Application for Testing

To run the full test suite including E2E tests:

1. Start the server and client:
   ```
   npm run start:dev
   ```

2. In a separate terminal, run the tests:
   ```
   npm test
   ```

### Video Recording

Cypress automatically records videos of test runs, which can be found in the `cypress/videos` directory:
- E2E test videos: `cypress/videos/quiz.cy.ts.mp4`
- Component test videos: `cypress/videos/Quiz.cy.tsx.mp4`

These videos are useful for:
- Documenting test behavior
- Debugging test failures
- Creating walkthrough demonstrations

### Video Walkthrough

The video walkthrough demonstrates:
1. Running component tests with `npm run test:component`
2. Starting the application with `npm run start:dev`
3. Running E2E tests with `npm run test:e2e`
4. Showing all tests passing
5. Reviewing the automatically generated test videos

## User Story

```
AS AN aspiring developer
I WANT to take a tech quiz
SO THAT I can test my knowledge and improve my skills
```

## Acceptance Criteria

```
GIVEN I am taking a tech quiz
WHEN I click the start button
THEN the quiz starts and I am presented with a question
WHEN I answer a question
THEN I am presented with another question
WHEN all questions are answered
THEN the quiz is over
WHEN the quiz is over
THEN I can view my score
WHEN the quiz is over
THEN I can start a new quiz
```

## Video Walkthrough

[Link to video walkthrough](your-video-link-here)