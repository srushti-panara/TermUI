import { type Screen, type Style, caps } from '@termuijs/core';
import { Widget } from '../base/Widget.js';

export interface CarouselOptions {
    loop?: boolean;
    showDots?: boolean;
    showArrows?: boolean;
}

export class Carousel extends Widget {
    private _items: string[];
    private _index = 0;
    private _loop: boolean;
    private _showDots: boolean;
    private _showArrows: boolean;

    constructor(
        items: string[],
        style: Partial<Style> = {},
        opts: CarouselOptions = {},
    ) {
        super(style);

        this._items = items;
        this._loop = opts.loop ?? false;
        this._showDots = opts.showDots ?? true;
        this._showArrows = opts.showArrows ?? true;
    }

    getIndex(): number {
        return this._index;
    }

    setIndex(index: number): void {
        if (this._items.length === 0) {
            this._index = 0;
        } else {
            this._index = Math.max(
                0,
                Math.min(index, this._items.length - 1),
            );
        }
    
        this.markDirty();
    }

    next(): void {
        if (this._items.length === 0) return;
    
        if (this._index < this._items.length - 1) {
            this._index++;
        } else if (this._loop) {
            this._index = 0;
        }
    
        this.markDirty();
    }

    prev(): void {
        if (this._items.length === 0) return;
    
        if (this._index > 0) {
            this._index--;
        } else if (this._loop) {
            this._index = this._items.length - 1;
        }
    
        this.markDirty();
    }
    
    setItems(items: string[]): void {
        this._items = items;
        this._index = 0;
        this.markDirty();
    }
    
    handleKey(key: string): void {
        switch (key) {
            case 'ArrowRight':
                this.next();
                break;
    
            case 'ArrowLeft':
                this.prev();
                break;
        }
    }

    protected _renderSelf(screen: Screen): void {
        const rect = this._getContentRect();
        const { x, y, width, height } = rect;
    
        if (width <= 0 || height <= 0) return;
    
        const current = this._items[this._index] ?? '';
    
        const leftArrow = caps.unicode ? '◄' : '<';
        const rightArrow = caps.unicode ? '►' : '>';
    
        const line =
            `${this._showArrows ? leftArrow + ' ' : ''}` +
            `Item ${this._index + 1} of ${this._items.length}: ${current}` +
            `${this._showArrows ? ' ' + rightArrow : ''}`;
    
        screen.writeString(x, y, line.slice(0, width));
    
        if (!this._showDots || height < 2) return;
    
        let dots = '';
    
        for (let i = 0; i < this._items.length; i++) {
            if (i > 0) dots += ' ';
    
            if (caps.unicode) {
                dots += i === this._index ? '●' : '○';
            } else {
                dots += i === this._index ? '*' : '.';
            }
        }
    
        screen.writeString(x, y + 1, dots.slice(0, width));
    }
}