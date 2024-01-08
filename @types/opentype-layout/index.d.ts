import { Font } from 'opentype.js';
export interface Options {
    align?: 'left' | 'center' | 'right';
    /**
     * Extra space between letters.
     * default: 0
     */
    letterSpacing?: number;
    /**
     * The max width of the text box. If the text overflows the box width, it will be broken into multiple lines.
     * default: Infinity
     */
    width?: number;
}
export default function getGlyphs(font: Font, text: string, opt: any): any;