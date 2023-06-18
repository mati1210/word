// created on 2022-12-30; updated on 2023-06-18
const DEFAULT_WORD = "word";
type RGB = [r: number, g: number, b: number]; // legacy
type ColorHex = string;

function getRndInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getElem(id: string): HTMLElement {
  let elem = document.getElementById(id);
  if (!elem) throw new Error(`${id} missing!`);
  return elem;
}

const params = new URLSearchParams(window.location.search);
function getQuery(query: string): string | null {
  return params.get(query);
}
function rgbToHex(rgb: RGB): ColorHex {
  let r = rgb[0].toString(16).padStart(2, "0");
  let g = rgb[1].toString(16).padStart(2, "0");
  let b = rgb[2].toString(16).padStart(2, "0");
  return `${r}${g}${b}`;
}
function randomColor(): ColorHex {
  return rgbToHex([getRndInt(0, 256), getRndInt(0, 256), getRndInt(0, 256)]);
}

namespace Saving {
  export type CurrentSave = SaveV4;
  export type Save = SaveV2 | SaveV3 | SaveV4;

  interface SaveV2 {
    word: RGB[];
    version: 2;
  }

  interface SaveV3 {
    colors: ColorHex[];
    version: 3;
  }

  interface SaveV4 {
    word: string;
    colors: ColorHex[];
    version: 4;
  }

  function v2to3(save: SaveV2): SaveV3 {
    let colors: ColorHex[] = [];
    for (const rgb of save.word) {
      colors.push(rgbToHex(rgb));
    }

    return { colors, version: 3 };
  }

  function v3to4(save: SaveV3): SaveV4 {
    return {
      word: DEFAULT_WORD,
      colors: save.colors,
      version: 4,
    };
  }

  export function convertSave(save: string | Save): CurrentSave | null {
    let s: Save = typeof save === "string" ? JSON.parse(save) : save;

    if (typeof s["version"] !== "number") return null;
    switch (s["version"]) {
      case 2:
        return convertSave(v2to3(s));
      case 3:
        return convertSave(v3to4(s));
      case 4:
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
  readonly clicker: HTMLElement;
  readonly resetb: HTMLElement;
  readonly editb: HTMLElement;

  constructor() {
    this.colors = [];
    this.word = DEFAULT_WORD;
    this.paragraph = getElem("p");

    let word = getQuery("word");
    let gotWordFromQuery = false;
    if (word) {
      this.word = word;
      gotWordFromQuery = true;
    }

    this.clicker = getElem("click!");
    this.clicker.onclick = () => this.add(randomColor());
    this.resetb = getElem("reset!");
    this.resetb.onclick = () => this.reset();
    this.editb = getElem("edit!");
    this.editb.onclick = () => this.editWordPrompt();

    let data = localStorage.getItem("word");
    if (!data) return;
    let save = Saving.convertSave(data);
    if (!save || !(save.colors instanceof Array)) return;

    this.colors = save.colors;
    if (!gotWordFromQuery) this.word = save.word;
    else this.save();

    this.draw();
  }

  save() {
    localStorage.setItem(
      "word",
      JSON.stringify(<Saving.CurrentSave>{
        word: this.word,
        colors: this.colors,
        version: 4,
      })
    );
  }

  unhideExtraButtons() {
    getElem("hider").innerHTML = ""; //TODO: make it rehideable
  }

  editWordPrompt() {
    let newWord = prompt("choose new word!", this.word);
    if (!newWord) return;

    this.word = newWord;
    this.save();
    this.draw();
  }

  get length(): number {
    return this.colors.length;
  }

  clearScreen() {
    this.paragraph.innerHTML = "";
    this.clicker.innerHTML = "click here!";
  }

  reset() {
    this.clearScreen();
    this.word = DEFAULT_WORD;
    this.colors = [];
    this.save();
  }

  draw() {
    this.clearScreen();
    if (this.length > 0) this.unhideExtraButtons();
    for (const word of this.colors) {
      this.drawOne(word);
    }
  }

  drawOne(color: ColorHex) {
    this.paragraph.innerHTML += `<span style="color:#${color}">${this.word}</span>`;
    this.clicker.innerHTML = `click here! (clicked ${this.length} times)`;
  }

  add(color: ColorHex) {
    this.unhideExtraButtons();
    this.colors.push(color);
    this.drawOne(color);
    this.save();
  }
}

var game;
window.addEventListener("DOMContentLoaded", () => {
  window.game = new Game();
});
