import * as opentype from 'opentype.js';
import drawText from '../src/canvas-wrap-text/index';
const keycode = require('keycode');
// test test2
// then get the test file at ps_test_files
const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
const ctx = canvas?.getContext('2d', { alpha: true }) as CanvasRenderingContext2D;
const element = document.querySelector('#textparent') as HTMLElement;


// get the text from the element

const fontPath = 'DejaVuSans.ttf';
opentype.load(fontPath, (err, font) => {
    if (err) throw err;

    // only render frames as needed   
    window.addEventListener('resize', () => render(font!));
    // add an event listner to the input boxes 
    document.querySelector('#width')?.addEventListener('input', () => render(font!));
    document.querySelector('#height')?.addEventListener('input', () => render(font!));
    document.querySelector('#minFontSize')?.addEventListener('input', () => render(font!));
    document.querySelector('#fontSize')?.addEventListener('input', () => render(font!));
    document.querySelector('#textValue')?.addEventListener('input', () => render(font!));
    document.querySelector('#lineHeight')?.addEventListener('input', () => render(font!));
    document.querySelector('#hAlign')?.addEventListener('input', () => render(font!));
    document.querySelector('#vAlign')?.addEventListener('input', () => render(font!));
    render(font!);
});

// get the size of the canvas

const dpr = window.devicePixelRatio;


const toggle = (el: HTMLElement) => {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.addEventListener('keydown', (ev) => {
    var code = keycode(ev);
    if (!ev.getModifierState('Control')) {
        return;
    }
    if (code === 'c') {
        toggle(canvas);
    } else if (code === 'd') {
        toggle(element);
    }
});

function render(font: opentype.Font) {
    // get width, height, font size, and text from input boxes
    const fontSizeEl = document.querySelector('#fontSize') as HTMLInputElement;
    const minFontSizeEl = document.querySelector('#minFontSize') as HTMLInputElement;
    const width = Number((document.querySelector('#width') as HTMLInputElement).value);
    const height = Number((document.querySelector('#height') as HTMLInputElement).value);
    let fontSize = Number(fontSizeEl.value);
    const text = (document.querySelector('#textValue') as HTMLInputElement).value;
    let minFontSize = Number(minFontSizeEl.value);
    const lineHeight = Number((document.querySelector('#lineHeight') as HTMLInputElement).value);
    const hAlign = (document.querySelector('#hAlign') as HTMLInputElement).value;
    const vAlign = (document.querySelector('#vAlign') as HTMLInputElement).value;

    if (minFontSize > fontSize) {
        minFontSize = fontSize;
        minFontSizeEl.value = String(minFontSize);
    }
    if (fontSize < minFontSize) {
        fontSize = minFontSize;
        fontSizeEl.value = String(fontSize);
    }
    // update the text element style
    let subelement = document.querySelector('#text') as HTMLElement;
    element.style.width = width + "px";
    element.style.height = height + "px";
    element.style.fontSize = fontSize + "px";
    subelement.textContent = text;
    element.style.lineHeight = "" + lineHeight;
    subelement.style.verticalAlign = vAlign;
    element.style.textAlign = hAlign;

    {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
    }

    fontSize = drawText(ctx, text, font, {
        x: 0,
        y: 0,
        width: width * dpr,
        height: height * dpr,
    }, {
        minSize: minFontSize * dpr,
        maxSize: fontSize * dpr,
        leading: lineHeight,
        hAlign: hAlign as "left" | "center" | "right",
        vAlign: vAlign as "top" | "center" | "middle" | "bottom",
        drawRect: false,
        textFillStyle: "#000000",
        rectFillOnlyText: true,
        textOuterStrokeWidth: 10,
        textOuterStrokeStyle: "white",
        textDescentAlignment: "box",
        hyphenate: true,
        fitMethod: "linebreaks"
    })
    element.style.fontSize = fontSize / dpr + "px";

}