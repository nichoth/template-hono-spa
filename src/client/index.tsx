import { hydrate, render } from 'preact'
import { App } from '../app.js'
import { State, type SerializedState } from '../state.js'

declare global {
    interface Window {
        __INITIAL_STATE__?:SerializedState
    }
}

const root = document.getElementById('root')
const initialState = window.__INITIAL_STATE__

if (root) {
    const state = await State({
        count: initialState?.count,
    })

    if (initialState) {
        hydrate(<App state={state} />, root)
    } else {
        render(<App state={state} />, root)
    }
}
