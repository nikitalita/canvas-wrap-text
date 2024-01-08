import { Box, Glue, Penalty, PositionedItem } from './layout';
export interface TextBox extends Box {
    text: string;
}
export interface TextGlue extends Glue {
    text: string;
}
export declare type TextInputItem = TextBox | TextGlue | Penalty;
/**
 * A convenience function that generates a set of input items for `breakLines`
 * from a string.
 *
 * @param s - Text to process
 * @param measureFn - Callback that calculates the width of a given string
 * @param hyphenateFn - Callback that calculates legal hyphenation points in
 *                      words and returns an array of pieces that can be joined
 *                      with hyphens.
 */
export declare function layoutItemsFromString(s: string, measureFn: (word: string) => number, hyphenateFn?: (word: string) => string[]): TextInputItem[];
/**
 * Helper for laying out a paragraph of text.
 *
 * @param text - The text to lay out
 * @param lineWidth - Width for each line
 * @param measure - Function which is called to measure each word or space in the input
 * @param hyphenate - Function which is called to split words at possible
 * hyphenation points
 */
export declare function layoutText(text: string, lineWidth: number | number[], measure: (word: string) => number, hyphenate: (word: string) => string[]): {
    items: TextInputItem[];
    breakpoints: number[];
    positions: PositionedItem[];
};
