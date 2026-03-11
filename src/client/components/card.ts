import type { FunctionComponent, ComponentChildren } from 'preact'
import { html } from 'htm/preact'

interface CardProps {
    title?:string;
    description?:string;
    class?:string;
    children?:ComponentChildren;
}

export const Card:FunctionComponent<CardProps> = function (props) {
    const { title, description, children } = props
    const classes = ['card', props.class].filter(Boolean).join(' ')

    return html`<div class="${classes}">
        ${title ?
            html`<h2>${title}</h2>` :
            null
        }
        
        ${description ? html`<p>${description}</p>` : null}
        ${children}
    </div>`
}
