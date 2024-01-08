/**
 * An object (eg. a word) to be typeset.
 */
export interface Box {
    type: 'box';
    /** Amount of space required by this content. Must be >= 0. */
    width: number;
}
/**
 * A space between `Box` items with a preferred width and some
 * capacity to stretch or shrink.
 *
 * `Glue` items are also candidates for breakpoints if they immediately follow a
 * `Box`.
 */
export interface Glue {
    type: 'glue';
    /**
     * Preferred width of this space. Must be >= 0.
     */
    width: number;
    /** Maximum amount by which this space can grow. */
    stretch: number;
    /** Maximum amount by which this space can shrink. */
    shrink: number;
}
/**
 * An explicit candidate position for breaking a line.
 */
export interface Penalty {
    type: 'penalty';
    /**
     * Amount of space required for typeset content to be added (eg. a hyphen) if
     * a line is broken here. Must be >= 0.
     */
    width: number;
    /**
     * The undesirability of breaking the line at this point.
     *
     * Values <= `MIN_COST` and >= `MAX_COST` mandate or prevent breakpoints
     * respectively.
     */
    cost: number;
    /**
     * A hint used to prevent successive lines being broken with hyphens. The
     * layout algorithm will try to avoid successive lines being broken at flagged
     * `Penalty` items.
     */
    flagged: boolean;
}
export declare type InputItem = Box | Penalty | Glue;
/**
 * Parameters for the layout process.
 */
export interface Options {
    /**
     * A factor indicating the maximum amount by which items in a line can be
     * spaced out by expanding `Glue` items.
     *
     * The maximum size which a `Glue` on a line can expand to is `glue.width +
     * (maxAdjustmentRatio * glue.stretch)`.
     *
     * If the paragraph cannot be laid out without exceeding this threshold then a
     * `MaxAdjustmentExceededError` error is thrown. The caller can use this to
     * apply hyphenation and try again. If `null`, lines are stretched as far as
     * necessary.
     */
    maxAdjustmentRatio: number | null;
    /**
     * The maximum adjustment ratio used for the initial line breaking attempt.
     */
    initialMaxAdjustmentRatio: number;
    /**
     * Penalty for consecutive hyphenated lines.
     */
    doubleHyphenPenalty: number;
    /**
     * Penalty for significant differences in the tightness of adjacent lines.
     */
    adjacentLooseTightPenalty: number;
}
/**
 * Minimum cost for a breakpoint.
 *
 * Values <= `MIN_COST` force a break.
 */
export declare const MIN_COST = -1000;
/**
 * Maximum cost for a breakpoint.
 *
 * Values >= `MAX_COST` prevent a break.
 */
export declare const MAX_COST = 1000;
/**
 * Error thrown by `breakLines` when `maxAdjustmentRatio` is exceeded.
 */
export declare class MaxAdjustmentExceededError extends Error {
}
/**
 * Break a paragraph of text into justified lines.
 *
 * Returns the indexes from `items` which have been chosen as breakpoints.
 * `positionBoxes` can be used to generate the X offsets and line numbers of
 * each box using the resulting breakpoints.
 *
 * May throw an `Error` if valid breakpoints cannot be found given the specified
 * adjustment ratio thresholds.
 *
 * The implementation uses the "TeX algorithm" from [1].
 *
 * [1] D. E. Knuth and M. F. Plass, “Breaking paragraphs into lines,” Softw.
 *     Pract. Exp., vol. 11, no. 11, pp. 1119–1184, Nov. 1981.
 *
 * @param items - Sequence of box, glue and penalty items to layout.
 * @param lineLengths - Length or lengths of each line.
 */
export declare function breakLines(items: InputItem[], lineLengths: number | number[], opts?: Partial<Options>): number[];
export interface PositionedItem {
    /** Index of the item. */
    item: number;
    /** Index of the line on which the resulting item should appear. */
    line: number;
    /** X offset of the item. */
    xOffset: number;
    /**
     * Width which this item should be rendered with.
     *
     * For box and penalty items this will just be the item's width.
     * For glue items this will be the adjusted width.
     */
    width: number;
}
/**
 * Compute adjustment ratios for lines given a set of breakpoints.
 *
 * The adjustment ratio of a line is the proportion of each glue item's stretch
 * (if positive) or shrink (if negative) which needs to be used in order to make
 * the line the specified width. A value of zero indicates that every glue item
 * is exactly its preferred width.
 *
 * @param items - The box, glue and penalty items being laid out
 * @param lineLengths - Length or lengths of each line
 * @param breakpoints - Indexes in `items` where lines are being broken
 */
export declare function adjustmentRatios(items: InputItem[], lineLengths: number | number[], breakpoints: number[]): number[];
export interface PositionOptions {
    includeGlue?: boolean;
}
/**
 * Compute the positions at which to draw boxes forming a paragraph given a set
 * of breakpoints.
 *
 * @param items - The sequence of items that form the paragraph.
 * @param lineLengths - Length or lengths of each line.
 * @param breakpoints - Indexes within `items` of the start of each line.
 */
export declare function positionItems(items: InputItem[], lineLengths: number | number[], breakpoints: number[], options?: PositionOptions): PositionedItem[];
/**
 * Return a `Penalty` item which forces a line-break.
 */
export declare function forcedBreak(): Penalty;
