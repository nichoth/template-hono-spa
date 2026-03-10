import type { FunctionComponent, ComponentChildren } from 'preact'

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
    return (
        <div class="card">
            <h2>{title}</h2>
            {description && <p>{description}</p>}
            {children}
        </div>
    )
}
