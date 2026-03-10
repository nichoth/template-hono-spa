import type { FunctionComponent, ComponentChildren } from 'preact'
import { html } from 'htm/preact'

interface CardProps {
    title?:string
    description?:string
    children?:ComponentChildren
}

export const Card:FunctionComponent<CardProps> = function ({
    title,
    description,
    children
}) {
    return html`<div class="card">
        ${title ?
            html`<h2>${title}</h2>` :
            null
        }
        
        ${description ? html`<p>${description}</p>` : null}
        ${children}
    </div>`
}
