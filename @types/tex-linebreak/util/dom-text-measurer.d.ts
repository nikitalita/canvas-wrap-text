/** Measure the width of pieces of text in the DOM, with caching. */
export default class DOMTextMeasurer {
    private _cache;
    constructor();
    /**
     * Return the width of `text` rendered by a `Text` node child of `context`.
     */
    measure(context: Element, text: string): number;
}
