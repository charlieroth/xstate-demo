import React from 'react'
import ReactDOM from 'react-dom'
import { useMachine, useActor } from '@xstate/react'
import { inspect } from '@xstate/inspect'
import { appMachine } from './appMachine'
import { ExerciseActor } from './exerciseMachine'
import { getLevels, getLevel, getExercise } from '../contentService'

inspect({ url: 'https://statecharts.io/inspect' })

interface ResultsViewProps {
  qCorrect: number
  qIncorrect: number
}
const ResultsView: React.FC<ResultsViewProps> = ({ qCorrect, qIncorrect }) => {
  return (
    <div className='results-container'>
      <h3 className='results-title'>Results</h3>
      <p className='results-info'>Questions Correct: {qCorrect}</p>
      <p className='results-info'>Querstions Incorrect: {qIncorrect}</p>
    </div>
  )
}

interface ExerciseViewProps {
  service: ExerciseActor
}
const ExerciseView: React.FC<ExerciseViewProps> = ({ service }) => {
  const [current, send] = useActor(service)
  const { qCorrect, qIncorrect, tries, maxTries, currQ, numQ } = current.context

  const handleAnswerClicked = (correct: boolean): void => {
    send({ type: 'ANSWER', correct: correct })
  }

  const exitExercise = (): void => {
    send({ type: 'EXIT' })
  }

  if (current.matches('results')) {
    return <ResultsView qCorrect={qCorrect} qIncorrect={qIncorrect} />
  }

  return (
    <div className='exercise-container'>
      <h3 className='question-title'>Will you answer the question correctly?</h3>
      <button className='question-btn' onClick={() => handleAnswerClicked(true)}>
        Yes
      </button>
      <button className='question-btn' onClick={() => handleAnswerClicked(false)}>
        No
      </button>
      <button className='question-btn' onClick={() => exitExercise()}>
        Exit
      </button>
      <div className='question-info-container'>
        <p className='question-info'>
          Tries: {tries} / {maxTries}
        </p>
        <p className='question-info'>
          Question: {currQ} / {numQ}
        </p>
      </div>
    </div>
  )
}

interface LevelMapViewProps {
  levelId: number
  enterExercise: (exerciseId: number) => void
  exitLevel: () => void
}
const LevelMapView: React.FC<LevelMapViewProps> = ({ levelId, enterExercise, exitLevel }) => {
  const exercises = getLevel(levelId).exercises.map((exerciseId) => getExercise(exerciseId))
  return (
    <div className='map-view-container'>
      <h3 className='map-view-title'>Level Map</h3>
      <button className='map-view-btn' onClick={exitLevel}>
        Exit
      </button>
      {exercises.map((e) => (
        <button className='map-view-btn' onClick={() => enterExercise(e.id)}>
          {e.title}
        </button>
      ))}
    </div>
  )
}

interface HomeViewProps {
  enterLevel: (levelId: number) => void
}
const HomeView: React.FC<HomeViewProps> = ({ enterLevel }) => {
  const levels = Object.values(getLevels())

  return (
    <div className='home-view-container'>
      <h3 className='home-view-title'>Home</h3>
      {levels.map((level) => (
        <button className='enter-level-btn' onClick={() => enterLevel(level.id)}>
          {level.title}
        </button>
      ))}
    </div>
  )
}

const App: React.FC = () => {
  const [current, send] = useMachine(appMachine, { devTools: true })
  const { exerciseActorRef, levelId } = current.context

  const enterExercise = (exerciseId: number): void => {
    send({ type: 'ENTER_EXERCISE', exerciseId: exerciseId })
  }

  const enterLevel = (levelId: number): void => {
    send({ type: 'ENTER_LEVEL', levelId: levelId })
  }

  const exitLevel = (): void => {
    send({ type: 'EXIT_LEVEL' })
  }

  return (
    <>
      {current.matches('home') && <HomeView enterLevel={enterLevel} />}
      {current.matches('level') && (
        <LevelMapView exitLevel={exitLevel} enterExercise={enterExercise} levelId={levelId || 0} />
      )}
      {current.matches('learning') && exerciseActorRef && <ExerciseView service={exerciseActorRef} />}
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
