import type { FunctionComponent, ComponentChildren } from 'preact'
import htm from 'htm'
import { h, Fragment } from 'preact'

const html = htm.bind(h)

interface CardProps {
    title:string
    description?:string
    children?:ComponentChildren
}

export const Card:FunctionComponent<CardProps> = function ({
    title,
    description,
    children
}) {
    return html`<div class="card">
            <h2>${title}</h2>
            ${description ? html`<p>${description}</p>` : null}
            <${Fragment}>${children}</${Fragment}>
        </div>`
}
