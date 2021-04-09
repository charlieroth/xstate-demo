import React from 'react'
import ReactDOM from 'react-dom'
import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'
import { inspect } from '@xstate/inspect'

inspect({ url: 'https://statecharts.io/inspect', iframe: false })

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

interface ExerciseMachineContext {
  problemMaxTries: number
  numProblems: number
  currTry: number
  currProblem: number
  numProblemsCorrect: number
  numProblemsIncorrect: number
}

export const exerciseMachine = Machine<ExerciseMachineContext>(
  {
    id: 'exercise-machine',
    initial: 'map',
    context: {
      problemMaxTries: 2,
      numProblems: 3,
      currTry: 1,
      currProblem: 1,
      numProblemsCorrect: 0,
      numProblemsIncorrect: 0,
    },
    states: {
      map: {
        meta: { message: 'User is on map page' },
        on: { EXERCISE: 'displayExercise' },
      },
      displayExercise: {
        meta: {},
        after: {
          1000: 'thinking',
        },
      },
      thinking: {
        meta: { message: 'User is thinking of which choice is correct' },
        on: {
          ANSWER: [
            {
              cond: 'isCorrect',
              target: 'correct',
              actions: ['correctAnswer'],
            },
            {
              cond: 'isIncorrect',
              target: 'incorrect',
              actions: ['incorrectAnswer'],
            },
          ],
          EXIT: { target: 'map' },
        },
      },
      correct: {
        meta: { message: "The user's answer was correct" },
        on: {
          '': [
            {
              cond: 'lastExercise',
              actions: ['sendResults'],
              target: 'map',
            },
            {
              cond: 'continue',
              actions: ['newExercise'],
              target: 'displayExercise',
            },
          ],
        },
      },
      incorrect: {
        meta: { message: "The user's answer was incorrect" },
        on: {
          '': [
            {
              cond: 'showAnswer',
              target: 'showAnswer',
            },
            {
              cond: 'continue',
              target: 'displayExercise',
            },
          ],
        },
      },
      showAnswer: {
        meta: {},
        after: {
          3000: 'displayExercise',
        },
      },
    },
  },
  {
    guards: {
      lastExercise: (c) => c.currProblem === c.numProblems,
      showAnswer: (c) => c.currTry == c.problemMaxTries,
      isCorrect: () => true,
      isIncorrect: () => true,
      continue: () => true,
    },
    actions: {
      correctAnswer: assign({
        numProblemsCorrect: (c) => c.numProblemsCorrect + 1,
        currTry: (c) => c.currTry + 1,
      }),
      incorrectAnswer: assign({
        numProblemsIncorrect: (c) =>
          c.currTry + 1 === c.problemMaxTries ?
            c.numProblemsIncorrect + 1
            : c.numProblemsIncorrect,
        currTry: (c) => c.currTry + 1,
      }),
      recordTry: assign({
        currTry: (c) => c.currTry + 1,
      }),
      sendResults: assign((c) => {
        console.log('RESULTS SUBMITTED: ', Date.now(), c)
        return c
      }),
      newExercise: assign({
        currTry: (c) => 1,
        currProblem: (c) => c.currProblem + 1,
      }),
    },
  },
)

function App() {
  const [current, send] = useMachine(exerciseMachine, { devTools: true })
  return (
    <div>
      <h1>Hello world</h1>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
