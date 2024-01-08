declare global {
    interface Range {
        intersectsNode(node: Node): boolean;
    }
}
/**
 * Return a list of `Text` nodes in `range`.
 *
 * `filter` is called with each node in document order in the subtree rooted
 * at `range.commonAncestorContainer`. If it returns false, that node and its
 * children are skipped.
 */
export declare function textNodesInRange(range: Range, filter: (n: Node) => boolean): Text[];
