import { type FunctionComponent } from 'preact'
import type { AppState } from '../../state.js'
import { About } from '../../routes/about.js'

export const AboutRoute:FunctionComponent<{ state:AppState }> = function AboutRoute () {
    return <About />
}
