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
    
    // Start quiz
    cy.get('.btn.btn-primary').click();
    cy.wait('@getQuestions');

    // Answer both questions to complete the quiz
    cy.get('.btn.btn-primary').first().click();
    cy.get('.btn.btn-primary').first().click();

    // Verify completion screen and click restart
    cy.get('h2').should('contain', 'Quiz Completed');
    cy.get('.btn.btn-primary').click();
    
    // Verify new API call and reset state
    cy.wait('@getQuestions');
    cy.get('h2').should('not.contain', 'Quiz Completed');
  });
});