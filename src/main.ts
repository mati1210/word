const DEFAULT_WORD = "word";

function getElem(id: string): HTMLElement {
  let elem = document.getElementById(id);
  if (!elem) throw new Error(`${id} missing!`);
  return elem;
}

const params = new URLSearchParams(window.location.search);
function getQuery(query: string): string | null {
  return params.get(query);
}

class Game {
  word: string;
  colors: Color.HEX[];
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
    this.clicker.onclick = () => this.add(Color.random());
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

  showExtraButtons(show: boolean) {
    let style = getElem("hider");
    if (show) style.innerText = "";
    else style.innerText = ".hidden{display:none}";
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
    this.showExtraButtons(false);
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
    if (this.length > 0) this.showExtraButtons(true);
    for (const word of this.colors) {
      this.drawOne(word);
    }
  }

  drawOne(color: Color.HEX) {
    this.paragraph.innerHTML += `<span style="color:#${color}">${this.word}</span>`;
    this.clicker.innerHTML = `click here! (clicked ${this.length} times)`;
  }

  add(color: Color.HEX) {
    this.showExtraButtons(true);
    this.colors.push(color);
    this.drawOne(color);
    this.save();
  }
}

var game;
window.addEventListener("DOMContentLoaded", () => {
  window.game = new Game();
});
