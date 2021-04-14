import { Machine, assign, spawn } from 'xstate'
import { v4 } from 'uuid'
import { createExerciseMachine, ExerciseActor } from './exerciseMachine'
import { getExercise } from '../contentService'

export interface AppContext {
  exerciseActorRef: ExerciseActor | null
  levelId: number | null
}

export interface AppStateSchema {
  states: {
    home: {}
    level: {}
    learning: {}
  }
}

export type AppEvent =
  | {
      type: 'ENTER_LEVEL'
      levelId: number
    }
  | {
      type: 'EXIT_LEVEL'
    }
  | {
      type: 'ENTER_EXERCISE'
      exerciseId: number
    }
  | {
      type: 'EXIT_EXERCISE'
    }

export const appMachine = Machine<AppContext, AppStateSchema, AppEvent>(
  {
    id: 'simple-albert-machine',
    initial: 'home',
    context: {
      exerciseActorRef: null,
      levelId: null,
    },
    states: {
      home: {
        on: {
          ENTER_LEVEL: {
            target: 'level',
            actions: assign({
              levelId: (_, e) => e.levelId,
            }),
          },
        },
      },
      level: {
        on: {
          ENTER_EXERCISE: {
            target: 'learning',
            actions: assign({
              exerciseActorRef: (_, e) => {
                const exercise = getExercise(e.exerciseId)
                return spawn(createExerciseMachine(exercise), v4()) as ExerciseActor
              },
            }),
          },
          EXIT_LEVEL: {
            target: 'home',
            actions: assign({
              exerciseActorRef: (_) => null,
              levelId: (_) => null,
            }),
          },
        },
      },
      learning: {
        on: {
          EXIT_EXERCISE: {
            target: 'level',
            actions: assign({
              exerciseActorRef: (_) => null,
            }),
          },
        },
      },
    },
  },
  {
    guards: {},
    actions: {},
    activities: {},
    delays: {},
    services: {},
  },
)
