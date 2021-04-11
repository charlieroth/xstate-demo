import { Machine, StateMachine, assign, sendParent } from 'xstate'

export interface ExerciseStateSchema {
  states: {
    learning: {}
    next: {}
    results: {}
    done: {}
  }
}

export type ExerciseEvent = 
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'ENTER'; }
  | { type: 'EXIT'; }

export interface ExerciseContext {
  title: string
  maxTries: number
  numQ: number
  currQCorrect: boolean
  tries: number
  currQ: number
  qCorrect: number
  qIncorrect: number
}

export interface ExerciseConfig {
  title: string;
  maxTries: number;
  numQ: number;
}

export type ExerciseMachine = StateMachine<ExerciseContext, ExerciseStateSchema, ExerciseEvent>

export const createExerciseMachine = (config: ExerciseConfig): ExerciseMachine => {
  return Machine<ExerciseContext, ExerciseStateSchema, ExerciseEvent>(
    {
      id: `'${config.title}' Machine`,
      initial: 'learning',
      context: {
        title: config.title,
        maxTries: config.maxTries,
        numQ: config.numQ,
        currQCorrect: false,
        tries: 1,
        currQ: 1,
        qCorrect: 0,
        qIncorrect: 0,
      },
      states: {
        learning: {
          on: {
            ANSWER: {
              actions: assign({
                currQCorrect: (_, e) => e.correct,
              }),
              target: 'next',
            },
            EXIT: {
              target: 'done'
            }
          },
        },
        next: {
          always: [
              {
                id: 'lastQIncorrectNoMoreTries',
                cond: 'lastQIncorrectNoMoreTries',
                actions: ['lastQIncorrectNoMoreTries'],
                target: 'results',
              },
              {
                id: 'lastQIncorrectMoreTries',
                cond: 'lastQIncorrectMoreTries',
                actions: ['lastQIncorrectMoreTries'],
                target: 'learning',
              },
              {
                id: 'incorrectNoMoreTries',
                cond: 'incorrectNoMoreTries',
                actions: ['incorrectNoMoreTries'],
                target: 'learning',
              },
              {
                id: 'incorrectMoreTries',
                cond: 'incorrectMoreTries',
                actions: ['incorrectMoreTries'],
                target: 'learning',
              },
              {
                id: 'lastQCorrect',
                cond: 'lastQCorrect',
                actions: ['lastQCorrect'],
                target: 'results',
              },
              {
                id: 'correct',
                cond: 'correct',
                actions: ['correct'],
                target: 'learning',
              },
           ],
        },
        results: {
          after: {
            3000: 'done',
          },
          exit: 'reset'
        },
        done: {
          entry: sendParent('EXIT_EXERCISE'),
        }
      },
    },
    {
      guards: {
        lastQIncorrectNoMoreTries: (c, _) => {
          return c.currQ === c.numQ && !c.currQCorrect && c.tries === c.maxTries
        },
        lastQIncorrectMoreTries: (c, _) => {
          return c.currQ === c.numQ && !c.currQCorrect && c.tries < c.maxTries
        },
        incorrectNoMoreTries: (c, _) => {
          return c.currQ < c.numQ && !c.currQCorrect && c.tries === c.maxTries
        },
        incorrectMoreTries: (c, _) => {
          return c.currQ < c.numQ && !c.currQCorrect && c.tries < c.maxTries
        },
        lastQCorrect: (c, _) => {
          return c.currQ === c.numQ && c.currQCorrect
        },
        correct: (c, _) => {
          return c.currQ < c.numQ && c.currQCorrect
        },
      },
      actions: {
        lastQIncorrectNoMoreTries: assign({
          qIncorrect: (c) => c.qIncorrect + 1,
        }),
        lastQIncorrectMoreTries: assign({
          tries: (c) => c.tries + 1,
        }),
        incorrectNoMoreTries: assign({
          tries: (_) => 1,
          currQ: (c) => c.currQ + 1,
          qIncorrect: (c) => c.qIncorrect + 1,
          currQCorrect: (_) => false
        }),
        incorrectMoreTries: assign({
          tries: (c) => c.tries + 1,
        }),
        correct: assign({
          tries: (_) => 1,
          currQ: (c) => c.currQ + 1,
          qCorrect: (c) => c.qCorrect + 1,
          currQCorrect: (_) => false
        }),
        lastQCorrect: assign({
          qCorrect: (c) => c.qCorrect + 1,
        }),
        reset: assign({
          currQCorrect: (_) => false,
          tries: (_) => 1,
          currQ: (_) => 1,
          qCorrect: (_) => 0,
          qIncorrect: (_) => 0,
        })
      },
      activities: {},
      delays: {},
      services: {},
    },
  )
}
