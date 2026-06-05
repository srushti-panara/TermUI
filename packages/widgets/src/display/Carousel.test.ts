import { describe, it, expect, vi } from 'vitest';
import { Carousel } from './Carousel.js';
import { Screen, caps } from '@termuijs/core';

describe('Carousel', () => {
    it('starts at index 0', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        expect(carousel.getIndex()).toBe(0);
    });

    it('next advances index', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.next();

        expect(carousel.getIndex()).toBe(1);
    });

    it('prev decrements index', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.next();
        carousel.prev();

        expect(carousel.getIndex()).toBe(0);
    });

    it('wraps forward when loop is true', () => {
        const carousel = new Carousel(
            ['A', 'B', 'C'],
            {},
            { loop: true },
        );

        carousel.setIndex(2);
        carousel.next();

        expect(carousel.getIndex()).toBe(0);
    });

    it('wraps backward when loop is true', () => {
        const carousel = new Carousel(
            ['A', 'B', 'C'],
            {},
            { loop: true },
        );

        carousel.prev();

        expect(carousel.getIndex()).toBe(2);
    });

    it('stops at last item when loop is false', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.setIndex(2);
        carousel.next();

        expect(carousel.getIndex()).toBe(2);
    });

    it('stops at first item when loop is false', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.prev();

        expect(carousel.getIndex()).toBe(0);
    });

    it('setItems resets index', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.next();
        carousel.setItems(['X', 'Y']);

        expect(carousel.getIndex()).toBe(0);
    });

    it('marks dirty after next()', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.clearDirty();
        carousel.next();

        expect(carousel.isDirty).toBe(true);
    });

    it('marks dirty after prev()', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.next();
        carousel.clearDirty();

        carousel.prev();

        expect(carousel.isDirty).toBe(true);
    });

    it('renders unicode dots', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.updateRect({
            x: 0,
            y: 0,
            width: 40,
            height: 2,
        });

        const screen = new Screen(40, 2);

        carousel.render(screen);

        const row = screen.back[1]
            .map((c: { char: string }) => c.char)
            .join('');

        expect(row).toContain('●');
        expect(row).toContain('○');
    });

    it('renders ascii dots when unicode is unavailable', () => {
        vi.spyOn(caps, 'unicode', 'get').mockReturnValue(false);

        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.updateRect({
            x: 0,
            y: 0,
            width: 40,
            height: 2,
        });

        const screen = new Screen(40, 2);

        carousel.render(screen);

        const row = screen.back[1]
            .map((c: { char: string }) => c.char)
            .join('');

        expect(row).toContain('*');
        expect(row).toContain('.');

    });

    it('hides dots when showDots is false', () => {
        const carousel = new Carousel(
            ['A', 'B', 'C'],
            {},
            { showDots: false },
        );

        carousel.updateRect({
            x: 0,
            y: 0,
            width: 40,
            height: 2,
        });

        const screen = new Screen(40, 2);

        carousel.render(screen);

        const row = screen.back[1]
            .map((c: { char: string }) => c.char)
            .join('');

        expect(row.trim()).toBe('');
    });

    it('does not render dots when height is less than 2', () => {
        const carousel = new Carousel(['A', 'B', 'C']);

        carousel.updateRect({
            x: 0,
            y: 0,
            width: 40,
            height: 1,
        });

        const screen = new Screen(40, 1);

        carousel.render(screen);

        expect(screen.back.length).toBe(1);
    });

    it('hides arrows when showArrows is false', () => {
        const carousel = new Carousel(
            ['A', 'B', 'C'],
            {},
            { showArrows: false },
        );

        carousel.updateRect({
            x: 0,
            y: 0,
            width: 40,
            height: 2,
        });

        const screen = new Screen(40, 2);

        carousel.render(screen);

        const row = screen.back[0]
            .map((c: { char: string }) => c.char)
            .join('');

        expect(row).not.toContain('◄');
        expect(row).not.toContain('►');
    });
});