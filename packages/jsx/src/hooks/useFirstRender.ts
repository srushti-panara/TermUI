import { useRef } from '../hooks.js';

export function useFirstRender(): boolean {
    const isFirstRender = useRef(true);

    if (isFirstRender.current) {
        isFirstRender.current = false;
        return true;
    }

    return false;
}