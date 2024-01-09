// import { Rules, Break } from '@cto.af/linebreak'
import { measureText } from '.'
import { hyphenateSync } from 'hyphen/en-us';
// let Rules: typeof import('@cto.af/linebreak').Rules;
// async function getUnified(): Promise<typeof import('@cto.af/linebreak').Rules> {
//     if (typeof Rules !== 'undefined') return Rules;
//     const mod = await (eval(`import('@cto.af/linebreak')`) as Promise<typeof import('@cto.af/linebreak')>);
//     Rules = mod.Rules
//     return Rules;
// }
import LineBreaker from 'linebreak';

export interface Brk {
    text: string,
    position: number,
    width: number,
    strippedWidth: number,
    isHyphenatedBreak: boolean,
    required: boolean
}

export function GetBreaks(textstr: string, hyphenate: boolean = false) {
    // const ruls_cls = await getUnified();
    // const breakGen = rules.breaks(text);
    const breaker = new LineBreaker(textstr);
    const breaks: Brk[] = [];
    let lastpos = 0;
    for (let brk = breaker.nextBreak(); brk; brk = breaker.nextBreak()) {
        if (!brk) {
            continue;
        }
        const { position, required } = brk;
        const text = textstr.slice(lastpos, position);
        lastpos = position;
        if (!text || text === '') {
            breaks.push({
                text: '',
                position,
                width: 0,
                strippedWidth: 0,
                isHyphenatedBreak: false,
                required
            });
            continue;
        }
        if (hyphenate) {
            let startPos = position - text.length;
            let hyphen_splits = hyphenateSync(text, { minWordLength: 7 }).split('\u00AD');
            let combLen = 0;
            if (hyphen_splits.length > 1) {
                for (let i = 0; i < hyphen_splits.length; i++) {
                    let split = hyphen_splits[i];
                    breaks.push({
                        text: split,
                        position: startPos + split.length + combLen,
                        width: 0,
                        strippedWidth: 0,
                        isHyphenatedBreak: i < hyphen_splits.length - 1 ? true : false,
                        required: i < hyphen_splits.length - 1 ? false : required
                    });
                    combLen += split.length;
                }
                continue;
            }
        }
        breaks.push({
            text,
            position,
            width: 0,
            strippedWidth: 0,
            isHyphenatedBreak: false,
            required
        });
    }
    return breaks;
}
export function SetBreakWidths(breaks: Brk[], measurefn: (text: string) => number) {
    for (let brk of breaks) {
        brk.width = measurefn(brk.text);
        brk.strippedWidth = measurefn(brk.text.trimEnd());
    }
}
export function GetLines(breaks: Brk[], maxWidth: number, measurefn: (text: string) => number) {
    let lines: string[] = [];
    let line = '';
    let lastbrk = breaks[0];
    let width = 0;
    let hyphenWidth = measurefn('-'); // we assume this is constant

    for (let brk of breaks) {
        let text = brk.text;
        let brkWidth = measurefn(text.trimEnd());
        let potentialWidth = width + brkWidth + (brk.isHyphenatedBreak ? hyphenWidth : 0);
        let broken_single = false;
        while (potentialWidth > maxWidth) {
            if (width === 0) {
                // This is a single word that is too long for the line
                // We need to break it up
                while (potentialWidth > maxWidth) {
                    let i = 0;
                    let word = text.trimEnd();
                    for (i = word.length - 1; i > 0; i--) {
                        let substr = word.slice(0, i);
                        brkWidth = measurefn(substr);
                        potentialWidth = width + brkWidth;
                        if (potentialWidth <= maxWidth) {
                            break;
                        }
                    }
                    if (i === 0) {
                        // This word is too long for the line
                        // Just add one character and push it
                        i = 1;
                    }
                    let substr = word.slice(0, i);
                    text = word.slice(i);
                    lines.push(substr.trimEnd());
                    line = '';
                    width = 0;
                    brkWidth = measurefn(text);
                    potentialWidth = brkWidth;
                }
                if (text === '') {
                    broken_single = true;
                }
            } else {
                line = line.trimEnd();
                if (lastbrk.isHyphenatedBreak) {
                    line += '-';
                }
                lines.push(line);
                line = '';
                width = 0;
            }

            potentialWidth = width + brkWidth;
        }
        if (broken_single) {
            continue;
        }
        width = width + measurefn(text);
        line += text;
        lastbrk = brk;
        if (brk.required) {
            line = line.trimEnd();
            if (lastbrk.isHyphenatedBreak) {
                line += '-';
            }
            lines.push(line);
            line = '';
            width = 0;
        }
    }
    if (line !== '') {
        lines.push(line);
    }
    return lines.map((line) => {
        return {
            text: line,
            width: measurefn(line)
        }
    });;
}