const WORD_VERSION = 3;
function dbg<T>(t: T): T {
    console.log(t);
    return t
}

type ColorHex = string;
namespace Saving {
    export type RGB = [number, number, number]; // legacy
    export type CurrentSave = SaveV3;
    export type Save = SaveV2 | SaveV3;

    export interface SaveV2 {
        word: RGB[],
        version: 2
    }

    export interface SaveV3 {
        colors: ColorHex[],
        version: 3
    }

    function v2to3(save: SaveV2): SaveV3 {
        let colors: ColorHex[] = [];
        for (let [r, g, b] of save.word) {
            colors.push(`${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
        }

        return { colors, version: 3 };
    }

    export function convertSave(save: string | Save): CurrentSave | null {
        let s;
        if (typeof save === "string") {
            s = JSON.parse(save)
        } else {
            s = save;
        }
        if (typeof s["version"] !== "number") return null

        switch (s["version"]) {
            case 2:
                return convertSave(v2to3(s));
            case 3:
                return s;
            default:
                return null;
        }
    }
}
import Save = Saving.convertSave


function getRndInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getElem(id: string): HTMLElement {
    let elem = document.getElementById(id);
    if (!elem)
        throw new Error(`${id} missing!`)
    return elem
}

function randomColor(): ColorHex {
    let r = getRndInt(0, 256).toString(16).padStart(2, '0');
    let g = getRndInt(0, 256).toString(16).padStart(2, '0');
    let b = getRndInt(0, 256).toString(16).padStart(2, '0');
    return `${r}${g}${b}`
}


class Game {
    word: string;
    colors: ColorHex[];
    paragraph: HTMLElement;
    clicker: HTMLElement;
    clearb: HTMLElement;

    constructor() {
        let word = getElem("word");

        this.colors = [];
        this.word = word instanceof HTMLMetaElement ? word.content : "word";
        this.paragraph = getElem("p")

        this.clicker = getElem("clicker");
        this.clicker.onclick = () => { this.add(randomColor()) }
        this.clearb = getElem("clear!");
        this.clearb.onclick = () => { this.clear() }
    }

    length(): number {
        return this.colors.length
    }

    clear() {
        this.paragraph.innerHTML = "";
        this.clicker.innerHTML = "click here!"
        this.colors = [];
    }

    draw() {
        for (let word of this.colors) {
            this.drawOne(word)
        }
    }

    drawOne(color: ColorHex) {
        this.paragraph.innerHTML += `<span style="color:#${color}">${this.word}</span>`
        this.clicker.innerHTML = `click here! (clicked ${this.length()} times)`
    }

    add(color: ColorHex) {
        this.colors.push(color);
        this.drawOne(color)
        this.save()
    }

    save() {
        localStorage.setItem("word", JSON.stringify({
            colors: this.colors,
            version: WORD_VERSION
        }))
    }

    static load(): Game {
        let word = new Game();
        let data = localStorage.getItem("word");
        if (!data) { return word; }
        let save = dbg(Saving.convertSave(data));
        if (!save || !(save.colors instanceof Array)) { return word; }

        word.colors = save.colors;
        word.draw();
        return word;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    Game.load();
});
