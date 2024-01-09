# canvas-wrap-text

Draws your string on a _canvas_, fit inside of a rectangle, with linebreaks at appropriate places and optional hyphenation.

## Requirements:
* [node-canvas](https://github.com/Automattic/node-canvas) to draw onto
* [opentype.js](https://github.com/nodebox/opentype.js/blob/master/README.md) to load OpenType fonts

## Installation

```npm install canvas-wrap-text canvas opentype.js --save```

## Run Demo

```npm run start```

## Parameters

This module exports a single function with signature:

1. context from node-canvas
2. a string to draw
3. font object
4. bounding rectangle ```{ x, y, width, height }```
5. options (see below)

### Options

* **minSize**: minimum font size ```float```
* **maxSize**: maximum font size ```float```
* **granularity**: a step, in which to scale font size ```float```
* **hAlign**: horizontal text alignment ```'left' | 'center' | 'right'```
* **vAlign**: vertical text alignment ```'top' | 'center' | 'bottom'```
* **leading**: leading ratio for line spacing ```float```
* **textDescentAlignment**: Whether or not the bottom of the text should be aligned to the baseline or the box ```'baseline' | 'box'```
* **fitMethod**: 'shrink' turns off linebreaks ```'linebreaks' | 'shrink'```
* **hyphenate**: enable hyphenation for linebreaks ```boolean```
* **drawRect**: draw the bounding rectangle ```'true' | 'false'```
* **textFillStyle**: fill style for text ```string```
* **rectFillStyle**: fill style for rectangle ```string```
* **rectFillOnlyText**: fill only the exact resulting text rectangle, not the bounding one ```'true' | 'false'```
* **textPadding**: text padding ```float```
* **fillPadding**: fill padding ```float```
* **textOuterStrokeWidth**: width of the outer stroke (outline) of the text (0 to disable) ```int```
* **textOuterStrokeStyle**: stroke style for text outer stroke ```string```

#### Defaults

```javascript
{
    minSize: 10,
    maxSize: 200,
    granularity: 1,
    hAlign: 'left',
    vAlign: 'bottom',
    leading: 1.2,
    hyphenate: false,
    fitMethod: 'linebreaks',
    textDescentAlignment: 'box',
    textFillStyle: '#000',
    rectFillStyle: 'transparent',
    rectFillOnlyText: false,
    textOuterStrokeWidth: 0,
    textOuterStrokeStyle: '#FFFFFF',
    textPadding: 0,
    fillPadding: 0,
    drawRect: false
}
```

## Example
```javascript
import drawText from 'canvas-wrap-text'
import opentype from 'opentype.js'
import Canvas from 'canvas'

let canvas = new Canvas(imgWidth, imgHeight);
let ctx = canvas.getContext('2d');

// Load OpenType fonts from files
let titleFont = opentype.loadSync(__dirname + '/fonts/PTN57F.ttf');
let priceFont = opentype.loadSync(__dirname + '/fonts/PTC75F.ttf');
let barcodeFont = opentype.loadSync(__dirname + '/fonts/code128.ttf');

// Strings to draw
let titleString = "A string, but not too long",
    priceString = "200",
    barcodeString = "54490000052117";

// Calculate bounding rectangles
let headerRect = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height / 3.5 };

let priceRect = {
    x: canvas.width / 2,
    y: headerRect.height,
    width: canvas.width / 2,
    height: canvas.height - headerRect.height };

let barcodeRect = {
    x: 0,
    y: headerRect.height + priceRect.height / 2,
    width: canvas.width - priceRect.width,
    height: priceRect.height / 2
};

// Draw
let drawRect = true;

drawText(ctx, titleString, titleFont, headerRect,
    {
        minSize: 5,
        maxSize: 100,
        vAlign: 'bottom',
        hAlign: 'left',
        textDescentAlignment: 'box',
        drawRect: drawRect} );

drawText(ctx, priceString, priceFont, priceRect,
    {
        minSize: 5,
        maxSize: 200,
        hAlign: 'right',
        vAlign: 'bottom',
        textDescentAlignment: 'box',
        drawRect: drawRect } );

drawText(ctx, barcodeString, barcodeFont, barcodeRect,
    {
        minSize: 5,
        maxSize: 200,
        hAlign: 'center',
        vAlign: 'center',
        textDescentAlignment: 'box',
        drawRect: drawRect });
```
