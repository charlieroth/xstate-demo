import React from 'react'
import ReactDOM from 'react-dom'
import { Machine } from 'xstate'
import { useMachine } from '@xstate/react'
import { inspect } from '@xstate/inspect'

inspect({ url: 'https://statecharts.io/inspect', iframe: false })

export const exerciseMachine = Machine(
  {
    id: 'exercise-machine',
    initial: 'map',
    context: {},
    states: {
      map: {
        meta: { message: 'User is on map page' },
        on: { ENTER_EXERCISE: 'thinking' },
      },
      thinking: {
        meta: { message: 'User is thinking of which choice is correct' },
        on: { ANSWER: 'answered' },
      },
      answered: {
        initial: 'processing',
        states: {
          processing: {
            meta: { message: "Application is processing the user's answer" },
            entry: 'determineResult',
          },
          correct: {
            meta: { message: "The user's answer was correct!" },
            entry: '',
          },
          incorrect: {
            meta: { message: "The user's answer was incorrect :(" },
            entry: 'forceSolve',
          },
          forceSolve: {
            meta: { message: 'The user has answered the question incorrectly twice' },
          },
        },
      },
      exit: {
        meta: { message: 'User has exited the exercise' },
        after: {
          500: 'map',
        },
      },
    },
  },
  {
    actions: {
      determineResult: (context, event) => {
        setTimeout(() => {
          console.log('Result determined!')
        }, 2000)
      },
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
