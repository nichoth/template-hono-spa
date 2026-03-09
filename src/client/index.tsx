import { render } from 'preact'
import { App } from '../app.js'
import { State } from '../state.js'

const root = document.getElementById('root')

if (root) {
    const state = await State()
    render(<App state={state} />, root)
}
