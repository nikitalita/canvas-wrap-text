/**
 * Reverse the changes made to an element by `justifyContent`.
 */
export declare function unjustifyContent(el: HTMLElement): void;
/**
 * Justify an existing paragraph.
 *
 * Justify the contents of `elements`, using `hyphenateFn` to apply hyphenation if
 * necessary.
 *
 * To justify multiple paragraphs, it is more efficient to call `justifyContent`
 * once with all the elements to be processed, than to call `justifyContent`
 * separately for each element. Passing a list allows `justifyContent` to
 * optimize DOM manipulations.
 */
export declare function justifyContent(elements: HTMLElement | HTMLElement[], hyphenateFn?: (word: string) => string[]): void;
