import * as opentype from 'opentype.js';
import { DrawOptions, DrawRectangle } from './index';
import drawText from './index';
import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
const dir = path.dirname(__filename);
// then get the parent
const parentdir = path.dirname(path.dirname(dir));
const ps_test_files = path.join(parentdir, 'ps_test_files');
// then get the test file at ps_test_files

const test_filename1 = 'testgroups.psd';
// const test_filename2 = 'testnogroups.psd';
// const test_filename3 = 'testgroups.psd';
const test_file1 = path.join(ps_test_files, test_filename1);
// const test_file2 = path.join(ps_test_files, test_filename2);
// const test_file3 = path.join(ps_test_files, test_filename3);
//F:\workspace\ag-psd\test\write\write-text\expected.psd
// const expected_file = path.join(dir, "test","write","write-text",'expected.psd');
// just read as an array of bytes

const test_raw = "/Users/nikita/Library/CloudStorage/GoogleDrive-monstermash2124@gmail.com/My Drive/Hard Boiled Scans/Josou-off-kai/raw/00037.png";


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

    drawText(ctx, "this is a long string", font, {
        x: 60,
        y: 30,
        width: 110,
        height: 100,
    }, {
        minSize: 18,
        maxSize: 18,
        hAlign: "center",
        vAlign: "center",
        drawRect: true,
        textFillStyle: "#000000",
        rectFillOnlyText: true,
        fitMethod: "box",
    })

    // save the canvas as a png
    fs.writeFileSync('out.png', canvas.toBuffer())

}

// function psd_add_layer(psd: Psd, image: Buffer){

// }

// psd_write_text_test(test_file1);
testthing().then(() => {
    console.log("done");
});