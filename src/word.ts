// created on 2022-12-30; updated on 2023-06-16
function dbg<T>(t: T): T {
    console.log(t);
    return t
}
type RGB = [r: number, g: number, b: number]; // legacy
type ColorHex = string;

function getRndInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getElem(id: string): HTMLElement {
    let elem = document.getElementById(id);
    if (!elem)
        throw new Error(`${id} missing!`)
    return elem
}

const params = new URLSearchParams(window.location.search)
function getQuery(query: string): string | null {
    return params.get(query);
}
function rgbToHex(rgb: RGB): ColorHex {
    let r = rgb[0].toString(16).padStart(2, '0');
    let g = rgb[1].toString(16).padStart(2, '0');
    let b = rgb[2].toString(16).padStart(2, '0');
    return `${r}${g}${b}`
}
function randomColor(): ColorHex {
    return rgbToHex([getRndInt(0, 256), getRndInt(0, 256), getRndInt(0, 256)])
}

namespace Saving {
    export const SAVE_VERSION = 3;
    export type CurrentSave = SaveV3;
    export type Save = SaveV2 | SaveV3;

    interface SaveV2 {
        word: RGB[],
        version: 2
    }

    interface SaveV3 {
        colors: ColorHex[],
        version: 3
    }

    function v2to3(save: SaveV2): SaveV3 {
        let colors: ColorHex[] = [];
        for (const rgb of save.word) {
            colors.push(rgbToHex(rgb))
        }

        return { colors, version: 3 };
    }

    export function convertSave(save: string | Save): CurrentSave | null {
        let s: Save = typeof save === "string" ? JSON.parse(save) : save;

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


class Game {
    word: string;
    colors: ColorHex[];
    paragraph: HTMLElement;

    //TODO: make all these its own class
    clicker: HTMLElement;
    clearb: HTMLElement;
    editb: HTMLElement;

    constructor() {
        let word = getQuery("word");

        this.colors = [];
        this.word = word ? word : "word";
        this.paragraph = getElem("p")

        this.clicker = getElem("click!");
        this.clicker.onclick = () => { this.unhideExtraButtons(); this.add(randomColor()) }
        this.clearb = getElem("clear!");
        this.clearb.onclick = () => this.clear();
        this.editb = getElem("edit!");
        this.editb.onclick = () => this.editWord();

        let data = localStorage.getItem("word");
        if (!data) { return; }
        let save = Saving.convertSave(data);
        if (!save || !(save.colors instanceof Array)) { return; }

        this.colors = save.colors;
        this.draw();
    }
    save() {
        localStorage.setItem("word", JSON.stringify(<Saving.CurrentSave>{
            colors: this.colors,
            version: Saving.SAVE_VERSION
        }))
    }
    unhideExtraButtons() {
        getElem("hider").innerHTML = "";
    }
    editWord() {
        let newWord = window.prompt("choose new word!", this.word);
        if (!newWord) return;

        window.location.search = `?word=${encodeURIComponent(newWord)}`
    }
    length(): number {
        return this.colors.length
    }
    clearScreen() {
        this.paragraph.innerHTML = "";
        this.clicker.innerHTML = "click here!"
    }
    clear() {
        this.clearScreen();
        this.colors = [];
        this.save()
    }
    draw() {
        this.clearScreen()
        if (this.length() > 0) this.unhideExtraButtons();
        for (const word of this.colors) {
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
}

var game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    window.game = game;
});