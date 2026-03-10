import { useSignal, type Signal } from '@preact/signals'
import { type ComponentChildren, type FunctionComponent } from 'preact'
import { useCallback } from 'preact/hooks'
import htm from 'htm'
import { h, Fragment } from 'preact'
import './button.css'

const html = htm.bind(h)

interface ButtonProps {
    onClick?:(ev:MouseEvent)=>void|Promise<void>;
    isSpinning?:Signal<boolean>;
    class?:string;
    className?:string;
    children?:ComponentChildren;
    disabled?:boolean;
}

export const Button:FunctionComponent<ButtonProps> = function (props) {
    const { isSpinning: _isSpinning, ..._props } = props
    const isSpinning = _isSpinning || useSignal<boolean>(false)

    const classes = ([
        'btn',
        props.class,
        props.className,
        isSpinning.value ? 'spinning' : ''
    ]).filter(Boolean).join(' ').trim()

    const click = useCallback(async (ev:MouseEvent) => {
        if (props.onClick) {
            isSpinning.value = true
            await props.onClick(ev)
            isSpinning.value = false
        }
    }, [])

    return html`<button
        ...${_props}
        onClick=${click}
        disabled=${isSpinning.value || _props.disabled}
        className=${classes}
    >
        <span className="btn-content">
            <${Fragment}>${props.children}</${Fragment}>
        </span>
    </button>`
}
