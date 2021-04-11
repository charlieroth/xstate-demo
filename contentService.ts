export interface ExerciseContent {
  id: number
  title: string
  maxTries: number
  numQ: number
}
export type ExercisesContent = Record<number, ExerciseContent>
const exercises = {
  1: {
    id: 1,
    title: 'Exercise 01',
    maxTries: 2,
    numQ: 4,
  },
  2: {
    id: 2,
    title: 'Exercise 02',
    maxTries: 2,
    numQ: 2,
  },
  3: {
    id: 3,
    title: 'Exercise 03',
    maxTries: 2,
    numQ: 3,
  },
  4: {
    id: 4,
    title: 'Exercise 04',
    maxTries: 2,
    numQ: 4,
  },
  5: {
    id: 5,
    title: 'Exercise 05',
    maxTries: 2,
    numQ: 9,
  },
  6: {
    id: 6,
    title: 'Exercise 06',
    maxTries: 2,
    numQ: 3,
  }
}

export interface LevelContent {
  id: number
  title: string
  exercises: number[]
}
export type LevelsContent = Record<number, LevelContent>
const levels: LevelsContent = {
  1: {
    id: 1,
    title: 'Level 01',
    exercises: [2, 3, 5]
  },
  2: {
    id: 2,
    title: 'Level 02',
    exercises: [3, 1, 5]
  },
  3: {
    id: 3,
    title: 'Level 03',
    exercises: [6, 1, 2]
  },
  4: {
    id: 4,
    title: 'Level 04',
    exercises: [3, 2, 5]
  },
}

export const getLevels = (): LevelsContent => levels;
export const getExercises = (): ExercisesContent => exercises;
export const getLevel = (id: number): LevelContent => levels[id];
export const getExercise = (id: number): ExerciseContent => exercises[id];
