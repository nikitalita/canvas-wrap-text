import * as opentype from 'opentype.js';
import { DrawOptions, DrawRectangle, measureText } from './index';
import drawText from './index';
import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import * as tex_linebreak from 'tex-linebreak';
const dir = path.dirname(__filename);
// then get the parent
const parentdir = path.dirname(path.dirname(dir));
const ps_test_files = path.join(parentdir, 'ps_test_files');
// then get the test file at ps_test_files


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
    var font = await opentype.load('/Users/nikita/Library/Fonts/CCWildWordsLower-Regular.ttf')
    const fontSize = 48;
    const teststring = "This is a really \n*rather*\nlong string!!!!!!! WOOOOO!!!!! YEAH!!!!!!!!!!";
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

}

// function psd_add_layer(psd: Psd, image: Buffer){

// }

// psd_write_text_test(test_file1);
testthing().then(() => {
    console.log("done");
});