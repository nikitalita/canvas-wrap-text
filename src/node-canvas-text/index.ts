import { Font } from "opentype.js";

// import default from linebreak
import { Brk, GetBreaks, SetBreakWidths, GetLines } from './linebreaks';
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
    let lines: { text: string, width: number }[] = [];
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
        lines = [{ text: text, width: textMetrics.width }];
    } else if (options.fitMethod == 'linebreaks') {
        // we have to use linebreaker to determine the best font size
        if (totalWidth > paddedRect.width || totalHeight > paddedRect.height) {
            let breaks = GetBreaks(text, options.hyphenate);
            while (fontSize >= options.minSize) {
                const measure = (text: string) => {
                    return measureText(text, fontObject, fontSize, options.textDescentAlignment).width;
                }
                let AD = Math.abs(fontObject.ascender - fontObject.descender);
                let L = lineHeightEM - AD;
                lineHeight = lineHeightEM * scale;
                lineHeightEM = fontObject.unitsPerEm * options.leading;
                scale = 1 / fontObject.unitsPerEm * fontSize
                actualBoundingBoxDescent = fontObject.descender * scale * options.leading; // use the font's descender instead of the text's actual descender to stop the text from wobbling up and down
                // lowpass filter here; we're going to take the best case scenario
                let estimatedLines = Math.ceil(totalWidth / paddedRect.width);
                let estimatedHeight = (AD + L) * estimatedLines * scale;
                if (estimatedHeight <= paddedRect.height) {
                    lines = GetLines(breaks, paddedRect.width, measure);
                    // get the largest width
                    totalWidth = lines.map((line) => line.width).reduce((a, b) => Math.max(a, b));

                    let totalHeightEM = (AD + L) * lines.length;
                    totalHeight = totalHeightEM * scale;
                    if (totalHeight <= paddedRect.height) {
                        break; // totalHeight and totalWidth are both within the paddedRect, so we're done
                    }
                }
                // height check failed, so we need to shrink the font size
                if (fontSize - options.granularity < options.minSize && fontSize > options.minSize) {
                    fontSize = options.minSize; // clamp to minSize
                } else {
                    fontSize = fontSize - options.granularity;
                }
                textMetrics = measureText(text, fontObject, fontSize, options.textDescentAlignment);
                totalWidth = textMetrics.width;

            }
        } else {
            lines = [{ text: text, width: textMetrics.width }];
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
        let fontPath = fontObject.getPath(line.text, calcXPos(line.width, paddedRect.x), lineYPos, fontSize);
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