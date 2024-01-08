export interface Patterns {
    id: string;
    leftmin: number;
    rightmin: number;
    patterns: {
        [key: string]: string;
    };
}
/**
 * Create a hyphenator that uses the given patterns.
 *
 * A wrapper around the `hypher` hyphenation library.
 */
export declare function createHyphenator(patterns: Patterns): (word: string) => string[];
