import React from 'react'
import ReactDOM from 'react-dom'
import create, { State } from 'zustand'
import * as tf from '@tensorflow/tfjs'
import * as sc from '@tensorflow-models/speech-commands'

// Globals & Constants
let recognizer: sc.SpeechCommandRecognizer

type RecognizerStatus = "active" | "inactive"
interface ExperimentStore extends State {
    experimentInfo: string
    setExperimentInfoText: (text: string) => void
    recognizerStatus: RecognizerStatus
    setRecognizerStatus: (status: RecognizerStatus) => void
}

const useExperimentStore = create<ExperimentStore>((set) => ({
    experimentInfo: "",
    setExperimentInfoText: (text: string) => set((state) => ({
        ...state,
        experimentInfo: text 
    })),
    recognizerStatus: "inactive",
    setRecognizerStatus: (status: RecognizerStatus) => set((state) => ({
        ...state,
        recognizerStatus: status
    }))
}))

async function setupRecognizer() {
    try {
        recognizer = sc.create('BROWSER_FFT')
        await recognizer.ensureModelLoaded()
        await tf.setBackend('cpu')
    } catch (e) {
        console.error(e)
    }
}

function App() {
    const {
        experimentInfo,
        setExperimentInfoText,
        recognizerStatus,
        setRecognizerStatus,
    } = useExperimentStore()

    const activateRecognizer = () => {
        setRecognizerStatus("active")
        const words = recognizer.wordLabels()
        recognizer.listen(async (result: sc.SpeechCommandRecognizerResult) => {
            const newScores = Array.from(result.scores as Float32Array).map((s, i) => ({
                score: s,
                word: words[i]
            }))
            newScores.sort((s1, s2) => s2.score - s1.score)
            setExperimentInfoText(newScores[0].word)
        }, { probabilityThreshold: 0.90 })
    }

    const deactivateRecognizer = () => {
        if (recognizer.isListening()) {
            setRecognizerStatus("inactive")
            recognizer.stopListening()
        } 
    }

    return (
        <div>
            <h1>React Tensorflow: Audio Recognition Example</h1>

            <button
                disabled={recognizerStatus === 'active'}
                onClick={() => activateRecognizer()}
            >Activate</button>
            <button
                disabled={recognizerStatus === 'inactive'}
                onClick={() => deactivateRecognizer()}
            >Deactivate</button>

            <h4>Recognizer Status: {recognizerStatus}</h4>
            <h4>Prediciting: {recognizerStatus === 'active' ? experimentInfo : "waiting for activation"}</h4>
        </div>
    )
}

setupRecognizer()

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
)
