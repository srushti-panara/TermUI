import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    createFiber,
    setCurrentFiber,
    clearCurrentFiber,
} from '../hooks.js';

import { useFirstRender } from './useFirstRender.js';

describe('useFirstRender', () => {
    let fiber = createFiber();

    beforeEach(() => {
        fiber = createFiber();
        setCurrentFiber(fiber);
    });

    afterEach(() => {
        clearCurrentFiber();
    });

    it('returns true on the first render', () => {
        expect(useFirstRender()).toBe(true);
    });

    it('returns false on the second render', () => {
        useFirstRender();

        fiber.hookIndex = 0;

        expect(useFirstRender()).toBe(false);
    });

    it('returns false on all later renders', () => {
        useFirstRender();

        fiber.hookIndex = 0;
        useFirstRender();

        fiber.hookIndex = 0;

        expect(useFirstRender()).toBe(false);
    });

    it('maintains state across multiple renders', () => {
        expect(useFirstRender()).toBe(true);

        fiber.hookIndex = 0;
        expect(useFirstRender()).toBe(false);

        fiber.hookIndex = 0;
        expect(useFirstRender()).toBe(false);
    });
});