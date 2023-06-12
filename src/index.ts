const WORD_VERSION = 2;

function getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

type RGB = [number, number, number];
function randomColor(): RGB {
    return [getRndInteger(0, 256), getRndInteger(0, 256), getRndInteger(0, 256)]
}

class Word {
    version: number;
    public words: RGB[];
    word: string;
    paragraph: HTMLElement;
    button: HTMLElement;

    constructor() {
        let paragraph = document.getElementById("p");
        let button = document.getElementById("button");
        let word = document.querySelector('meta[name="word"]');
        if (!paragraph || !button || !word)
            throw new Error("some html is missing!");

        button.onclick = () => { this.add(randomColor()) }
        this.version = WORD_VERSION;
        this.words = [];
        this.word = word instanceof HTMLMetaElement ? word.content : "";
        this.paragraph = paragraph;
        this.button = button;
    }

    length(): number {
        return this.words.length
    }

    clear() {
        this.paragraph.innerHTML = "";
        this.button.innerHTML = "click here! (clicked 0 times)"
        this.words = [];
    }

    draw() {
        for (let word of this.words) {
            this.drawOne(word)
        }
    }

    drawOne(word: RGB) {
        this.paragraph.innerHTML += `<span style="color: rgb(${word[0]}, ${word[1]}, ${word[2]})">word</span>`
        this.button.innerHTML = `click here! (clicked ${this.length()} times)`
    }

    add(rgb: RGB) {
        this.words.push(rgb);
        this.drawOne(rgb)
        this.save()
    }

    save() {
        localStorage.setItem("word", JSON.stringify({
            word: this.words,
            version: this.version
        }))
    }

    static load(): Word {
        let word = new Word();
        let data = localStorage.getItem("word");
        if (!data) { return word; }
        let json: { word: RGB[], version: number } = JSON.parse(data);
        if (json["version"] < WORD_VERSION) { return word; }

        word.words = json["word"]
        word.draw();
        return word;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    Word.load();
});
