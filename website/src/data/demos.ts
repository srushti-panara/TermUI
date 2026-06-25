import type { RootWidget } from '@termuijs/core'
import { Badge } from '@termuijs/widgets'
import { Alert } from '@termuijs/widgets'
import { Spinner } from '@termuijs/widgets'
import { ProgressCircle } from '@termuijs/widgets'
import { TextInput } from '@termuijs/widgets'

const demos: Record<string, () => RootWidget> = {
    // display
    'badge': () => new Badge('v0.1.7', {}, { variant: 'success' }),

    // feedback — static
    'alert': () => new Alert({ variant: 'info', message: 'Component loaded successfully' }),

    // feedback — animated (tests FPS render loop)
    'spinner': () => new Spinner({}, { label: 'Loading components…' }),

    // data — progress arc
    'progress-circle': () => new ProgressCircle({}, { value: 72, label: '72%' }),

    // input — keyboard interaction
    'text-input': () => new TextInput({}, { placeholder: 'Type something…' }),
}

export default demos
