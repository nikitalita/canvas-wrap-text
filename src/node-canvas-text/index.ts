import { Font } from "opentype.js";

// import default from linebreak
import LineBreaker from 'linebreak';
import { HyphenationFunctionSync } from 'hyphen';
import { hyphenateSync } from 'hyphen/en-us';
import * as tex_linebreak from 'tex-linebreak';
export interface DrawOptions {
    drawRect: boolean;
    textDescentAlignment: "baseline" | "box";
    fitMethod: "linebreaks" | "shrink" | "none";
    leading: number;
    hyphenate: boolean;
    fillPadding: number;
    granularity: number;
    hAlign: "center" | "left" | "right" | "middle";
    maxSize: number;
    minSize: number;
    rectFillOnlyText: boolean;
    rectFillStyle: string;
    textFillStyle: string;
    textPadding: number;
    vAlign: "bottom" | "center" | "top" | "middle" | "baseline";
}

class Break {
    position: number = 0;
    required: boolean = false;
}

export interface DrawRectangle {
    height: number;
    width: number;
    x: number;
    y: number;
}

interface TextMetrics {
    width: number;
    height: number;
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
    fontBoundingBoxAscent: number;
    fontBoundingBoxDescent: number;
}
function getLines2(fontObject: Font, text: string, fontSize: number, paddedRect: DrawRectangle, options: DrawOptions) {
    const measure = (text: string) => {
        return measureText(text, fontObject, fontSize, options.textDescentAlignment).width;
    }
    let items = tex_linebreak.layoutItemsFromString(text, measure);
    const forcedBreaks: number[] = [];

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.type === "glue") {
            if (item.text.includes('\n')) {
                // forcedBreaks.push(i);
                // item.width = paddedRect.width + 1;
            }
        }
    }
    // for (let i = forcedBreaks.length - 1; i >= 0; i--) {
    //     // insert a tex_linebreak.forcedBreak() in between the items
    //     items = items.slice(0, forcedBreaks[i] + 1).concat(tex_linebreak.forcedBreak()).concat(items.slice(forcedBreaks[i] + 1));
    // }
    const breakpoints = tex_linebreak.breakLines(items, paddedRect.width, {
        maxAdjustmentRatio: 1.0,
        initialMaxAdjustmentRatio: 1.0

    });
    var lines: { text: string, metrics: TextMetrics }[] = [];
    let curLineStart = 0;
    for (let i = 0; i < breakpoints.length; i++) {
        if (breakpoints[i] === 0) {
            continue;
        }
        let curLine = "";
        let width = 0;
        items.slice(curLineStart, breakpoints[i]).forEach((item) => {
            if (item.type !== "penalty") {
                curLine += item.text;
                width += item.width;
            }
        });
        lines.push({ text: curLine, metrics: { width: width } as TextMetrics });
        curLineStart = breakpoints[i] + 1;
    }
    //TODO: remove
    for (let line of lines) {
        if (line.metrics.width > paddedRect.width) {
            console.log("line '" + line.text + "' width is too large: " + line.metrics.width + " > " + paddedRect.width);
        }
    }
    return lines;
}
function getLines(fontObject: Font, text: string, fontSize: number, paddedRect: DrawRectangle, options: DrawOptions) {
    let largestWidth = 0;
    let textcopy = text;
    let lineMetrics = measureText(textcopy, fontObject, fontSize, options.textDescentAlignment);
    let lastMetric: TextMetrics = lineMetrics;
    let lines: { text: string, metrics: TextMetrics }[] = [];
    let substrWidths = getAllPossibleSubstrWidths(text, fontObject, fontSize);
    while ((lineMetrics.width > paddedRect.width)) {
        // iterate over all the linebreaks until we reach one that goes over paddedRect.width, then use the previous one
        let breaker = new LineBreaker(textcopy);
        let lastBreak: Break = { position: 0, required: false };
        let bk: Break;
        while (bk = breaker.nextBreak()) {
            let substr = textcopy.slice(0, bk.position);
            let possibleText = substr.trimEnd();
            let brkEndPos = bk.position + substr.length - possibleText.length;
            let possibleMetrics = measureText(possibleText, fontObject, fontSize, options.textDescentAlignment);
            if (possibleMetrics.width > paddedRect.width) {
                if (options.hyphenate) {
                    // check to see if the word between the last break and the current break can be hyphenated
                    let line = textcopy.slice(0, lastBreak.position)
                    let word = textcopy.slice(lastBreak.position, bk.position);
                    let hyphenatedWord = hyphenateSync(word);
                    let hyphenatedparts = hyphenatedWord.split("\u00AD")
                    if (hyphenatedparts.length > 1) {
                        let i = 0;
                        let partpos = lastBreak.position;
                        let hyphenatedpartspos = hyphenatedparts.map((part) => {
                            let ret = partpos;
                            partpos += part.length;
                            return ret;
                        });
                        for (i = hyphenatedparts.length - 1; i >= 0; i--) {
                            possibleText = line + hyphenatedparts.slice(0, i).join("") + "-";
                            possibleMetrics = measureText(possibleText, fontObject, fontSize, options.textDescentAlignment);
                            if (possibleMetrics.width <= paddedRect.width) {
                                break;
                            }
                        }
                        if (i >= 0) {
                            // we found a hyphenation that works
                            lines.push({
                                text: possibleText,
                                metrics: possibleMetrics
                            });
                            textcopy = textcopy.slice(hyphenatedpartspos[i]);
                            break;
                        }
                    }
                }
                if (lastBreak.position == 0) {
                    // panic mode, we have to break on a word
                    for (lastBreak.position = bk.position - 1; lastBreak.position > 0; lastBreak.position--) {
                        possibleText = textcopy.slice(0, lastBreak.position).trim();
                        possibleMetrics = measureText(possibleText, fontObject, fontSize, options.textDescentAlignment);
                        if (possibleMetrics.width <= paddedRect.width) {
                            break;
                        }
                    }
                    if (lastBreak.position == 0) {
                        // welp, just make this a single character
                        lastBreak.position = 1;
                    }
                    lastMetric = possibleMetrics;
                }
                // we have gone over the paddedRect.width, so use the last break
                // TODO: hyphenate
                lines.push({
                    text: textcopy.slice(0, lastBreak.position).trimEnd(),
                    metrics: lastMetric
                });
                textcopy = textcopy.slice(lastBreak.position).trimStart();
                break;
            } else if (bk.required) {
                lines.push({
                    text: possibleText,
                    metrics: possibleMetrics
                });
                textcopy = textcopy.slice(bk.position); // if explicit linebreak, don't trim, just skip over the linebreak
                break;
            }
            lastBreak = bk;
            lastMetric = possibleMetrics;
            largestWidth = largestWidth < possibleMetrics.width ? possibleMetrics.width : largestWidth;
        }
        lineMetrics = measureText(textcopy, fontObject, fontSize, options.textDescentAlignment);
    }
    // push the last line
    lines.push({
        text: textcopy,
        metrics: lineMetrics
    });

    return lines;
}

export function getAllPossibleSubstrWidths(text: string, font: Font, fontSize: number) {
    let ascent = 0,
        descent = 0,
        width = 0,
        scale = 1 / font.unitsPerEm * fontSize,
        glyphs = font.stringToGlyphs(text);
    let widths: number[] = [];
    for (var i = 0; i < glyphs.length; i++) {
        let glyph = glyphs[i];
        if (glyph.advanceWidth) {
            width += glyph.advanceWidth * scale;
        }
        if (i > 0 && i < glyphs.length - 1) {
            let kerningValue = font.getKerningValue(glyphs[i - 1], glyphs[i]);
            width += kerningValue * scale;
        }
        widths.push(width);
    }
    return widths;
}

export function measureText(text: string, font: Font, fontSize: number, method: "baseline" | "box" = 'box'): TextMetrics {
    let ascent = 0,
        descent = 0,
        width = 0,
        scale = 1 / font.unitsPerEm * fontSize,
        glyphs = font.stringToGlyphs(text);

    for (var i = 0; i < glyphs.length; i++) {
        let glyph = glyphs[i];
        if (glyph.advanceWidth) {
            width += glyph.advanceWidth * scale;
        }
        if (i < glyphs.length - 1) {
            let kerningValue = font.getKerningValue(glyph, glyphs[i + 1]);
            width += kerningValue * scale;
        }

        let { yMin, yMax } = glyph.getMetrics();

        ascent = Math.max(ascent, yMax);
        descent = Math.min(descent, yMin);
    }
    return {
        width: width,
        height: method == 'box' ? Math.abs(ascent) * scale + Math.abs(descent) * scale : Math.abs(ascent) * scale,
        actualBoundingBoxAscent: ascent * scale,
        actualBoundingBoxDescent: descent * scale,
        fontBoundingBoxAscent: font.ascender * scale,
        fontBoundingBoxDescent: font.descender * scale
    };
};

function padRectangle(rectangle: DrawRectangle, padding: number) {
    return {
        x: rectangle.x - padding,
        y: rectangle.y - padding,
        width: rectangle.width + (padding * 2),
        height: rectangle.height + (padding * 2)
    }
};

export default function drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    fontObject: Font,
    _rectangle?: DrawRectangle,
    _options?: Partial<DrawOptions>,
) {

    let paddedRect = {
        ...{
            x: 0,
            y: 0,
            width: 100,
            height: 100
        }, ..._rectangle
    };

    let options: DrawOptions = {
        ...{
            minSize: 10,
            maxSize: 200,
            granularity: 1,
            hAlign: 'left',
            vAlign: 'bottom',
            leading: 1.2,
            hyphenate: false,
            fitMethod: 'shrink',
            textDescentAlignment: 'box',
            textFillStyle: '#000',
            rectFillStyle: 'transparent',
            rectFillOnlyText: false,
            textPadding: 0,
            fillPadding: 0,
            drawRect: false
        }, ..._options
    };

    if (typeof text != 'string') throw 'Missing string parameter';
    if (typeof fontObject != 'object') throw 'Missing fontObject parameter';
    if (typeof ctx != 'object') throw 'Missing ctx parameter';
    if (options.minSize > options.maxSize) throw 'Min font size can not be larger than max font size';

    let originalRect = paddedRect;
    paddedRect = padRectangle(paddedRect, options.textPadding);

    ctx.save();

    let fontSize = options.maxSize;
    let textMetrics = measureText(text, fontObject, fontSize, options.textDescentAlignment);
    let totalWidth = textMetrics.width;
    let totalHeight = textMetrics.height;
    let actualBoundingBoxDescent = textMetrics.actualBoundingBoxDescent;
    let lines: { text: string, metrics: TextMetrics }[] = [];
    let lineHeightEM = fontObject.unitsPerEm * options.leading;
    let scale = 1 / fontObject.unitsPerEm * fontSize
    let lineHeight = lineHeightEM * scale;
    if (options.fitMethod == 'shrink') {
        while ((totalWidth > paddedRect.width || totalHeight > paddedRect.height) && fontSize >= options.minSize) {
            fontSize = fontSize - options.granularity;
            textMetrics = measureText(text, fontObject, fontSize, options.textDescentAlignment);
            totalWidth = textMetrics.width;
            totalHeight = textMetrics.height;
            actualBoundingBoxDescent = textMetrics.actualBoundingBoxDescent;
            lineHeightEM = fontObject.unitsPerEm * options.leading;
            scale = 1 / fontObject.unitsPerEm * fontSize
            lineHeight = lineHeightEM * scale;
        }
        lines = [{ text: text, metrics: textMetrics }];
    } else if (options.fitMethod == 'linebreaks') {
        // we have to use linebreaker to determine the best font size
        while (fontSize >= options.minSize) {
            lines = getLines2(fontObject, text, fontSize, paddedRect, options);
            actualBoundingBoxDescent = fontObject.descender * scale * options.leading; // use the font's descender instead of the text's actual descender to stop the text from wobbling up and down
            // get the largest width
            totalWidth = lines.map((line) => line.metrics.width).reduce((a, b) => Math.max(a, b));
            lineHeightEM = fontObject.unitsPerEm * options.leading;
            scale = 1 / fontObject.unitsPerEm * fontSize
            lineHeight = lineHeightEM * scale;
            let AD = Math.abs(fontObject.ascender - fontObject.descender);
            let L = lineHeightEM - AD;
            let totalHeightEM = (AD + L) * lines.length;
            totalHeight = totalHeightEM * scale;
            if (totalHeight <= paddedRect.height) {
                break; // totalHeight and totalWidth are both within the paddedRect, so we're done
            } else { // step down in font size and try again
                if (fontSize - options.granularity < options.minSize && fontSize > options.minSize) {
                    fontSize = options.minSize; // clamp to minSize
                } else {
                    fontSize = fontSize - options.granularity;
                }
            }
        }
        if (fontSize < options.minSize) {
            fontSize = options.minSize;
        }
    }

    // Calculate text coordinates based on options
    let startXPos = calcXPos(totalWidth, paddedRect.x);
    let startYPos = options.textDescentAlignment == 'box'
        ? paddedRect.y + paddedRect.height - Math.abs(actualBoundingBoxDescent)
        : paddedRect.y + paddedRect.height;

    switch (options.vAlign) {
        case 'top':
            startYPos = startYPos - paddedRect.height + totalHeight;
            break;
        case 'center': case 'middle':
            startYPos = startYPos + totalHeight / 2 - paddedRect.height / 2;
            break;
        case 'bottom': case 'baseline':
            break;
        default:
            throw "Invalid options.vAlign parameter: " + options.vAlign;
            break;

    }
    ctx.fillStyle = 'transparent';

    // Draw fill rectangle if needed
    if (options.rectFillStyle != 'transparent') {
        let fillRect = options.rectFillOnlyText ? {
            x: startXPos,
            y: startYPos - totalHeight,
            width: totalWidth,
            height: totalHeight
        } : originalRect;

        fillRect = padRectangle(fillRect, options.fillPadding);

        ctx.fillStyle = options.rectFillStyle;
        ctx.fillRect(fillRect.x, fillRect.y, fillRect.width, fillRect.height);
        ctx.fillStyle = 'transparent';
    }

    // Draw text
    var lineYPos = startYPos;
    for (let i = lines.length - 1; i >= 0; i--) {
        var line = lines[i];
        let fontPath = fontObject.getPath(line.text, calcXPos(line.metrics.width, paddedRect.x), lineYPos, fontSize);
        fontPath.fill = options.textFillStyle;
        ctx.save();
        fontPath.draw(ctx);
        ctx.restore();
        lineYPos -= lineHeight;
    }

    // Draw bounding rectangle
    if (options.drawRect) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.strokeRect(paddedRect.x, paddedRect.y, paddedRect.width, paddedRect.height);
        ctx.strokeStyle = 'transparent';
        ctx.restore();
    }

    ctx.restore();

    function calcXPos(TextWidth: number, startXPos: number) {
        switch (options.hAlign) {
            case 'right':
                return startXPos + paddedRect.width - TextWidth;
            case 'center': case 'middle':
                return startXPos + (paddedRect.width / 2) - (TextWidth / 2);
            case 'left':
                return startXPos;
            default:
                throw "Invalid options.hAlign parameter: " + options.hAlign;
        }
    }
    return fontSize;
};