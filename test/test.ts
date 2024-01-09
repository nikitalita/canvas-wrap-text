import * as opentype from 'opentype.js';
import { DrawOptions, DrawRectangle, measureText } from '../src/node-canvas-text/index';
import drawText from '../src/node-canvas-text/index';
import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { Brk, GetBreaks, SetBreakWidths, GetLines } from '../src/node-canvas-text/linebreaks';
const dir = path.dirname(__filename);
// then get the parent
const parentdir = path.dirname(dir);
const ps_test_files = path.join(parentdir, 'ps_test_files');
// then get the test file at ps_test_files

const teststring = "This is a really \n*rather*\nlong string!!!!!!! WOOOOO!!!!! YEAH!!!!!!!!!!";

async function testthing() {
    var canvas = createCanvas(500, 500);
    var ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D><unknown>canvas.getContext('2d')
    if (!ctx) {
        throw new Error("no context");
    }
    ctx!.clearRect(0, 0, 500, 500);
    // fill canvas with white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 500, 500);
    var font = opentype.loadSync(path.join(parentdir, 'demo', 'TestFont.ttf'))
    const fontSize = 48;
    const textDescentAlignment = "box";
    var options = {
        minSize: 10,
        maxSize: fontSize,
        hAlign: "center",
        vAlign: "center",
        drawRect: true,
        textFillStyle: "#000000",
        rectFillOnlyText: true,
        textDescentAlignment: textDescentAlignment,
        fitMethod: "linebreaks",
        leading: 1.2,
    } as DrawOptions;
    var bbox = {
        x: 60,
        y: 30,
        width: 400,
        height: 400,
    } as DrawRectangle;
    drawText(ctx, teststring, font, bbox, options);
    // save the canvas as a png sds
    fs.writeFileSync('out.png', canvas.toBuffer())
}

function texLineBreakTest() {
    const testString = "oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo";
    let thing = GetBreaks(testString, true);
    var font = opentype.loadSync(path.join(parentdir, 'demo', 'TestFont.ttf'))
    const fontSize = 48;
    const textDescentAlignment = "box";
    var options = {
        minSize: 10,
        maxSize: fontSize,
        hAlign: "center",
        vAlign: "center",
        drawRect: true,
        textFillStyle: "#000000",
        rectFillOnlyText: true,
        textDescentAlignment: textDescentAlignment,
        fitMethod: "linebreaks",
        leading: 1.2,
    } as DrawOptions;

    const measure = (text: string) => {
        return measureText(text, font, fontSize, options.textDescentAlignment).width;
    }

    SetBreakWidths(thing, measure);
    const lines = GetLines(thing, 400, measure);
    console.log(lines);
}

// function psd_add_layer(psd: Psd, image: Buffer){

// }

// psd_write_text_test(test_file1);
texLineBreakTest()
testthing().then(() => {
    console.log("done");
});