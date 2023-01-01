const WORD_VERSION = 2;

function getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

type RGB = [number, number, number];
export function randomColor(): RGB {
    return [getRndInteger(0, 256), getRndInteger(0, 256), getRndInteger(0, 256)]
}

class Word {
    public word: RGB[];
    version: number;
    paragraph: HTMLElement;
    button: HTMLElement;

    constructor() {
        let paragraph = document.getElementById("p");
        let button = document.getElementById("button");
        if (!paragraph) {
            throw new Error("p not present!");
        }
        if (!button) {
            throw new Error("word not present!");
        }
        this.version = WORD_VERSION;
        this.paragraph = paragraph;
        this.button = button;
        this.word = new Array();
    }

    length(): number {
        return this.word.length
    }

    draw() {
        for (let word of this.word) {
            this.drawOne(word)
        }
    }

    drawOne(word: RGB) {
        this.paragraph.innerHTML += `<span style="color: rgb(${word[0]}, ${word[1]}, ${word[2]})">word</span>`
        this.button.innerHTML = `click here! (clicked ${this.length()} times)`
    }

    add(rgb: RGB) {
        this.word.push(rgb);
        this.drawOne(rgb)
        this.save()
    }

    save() {
        localStorage.setItem("word", JSON.stringify({
            word: this.word,
            version: this.version
        }))
    }

    static load(): Word {
        let word = new Word();
        let data = localStorage.getItem("word");
        if (!data) { return word; }
        let json: { word: RGB[], version: number } = JSON.parse(data);
        if (json["version"] < WORD_VERSION) { return word; }

        word.word = json["word"]
        word.draw();
        return word;
    }
}

window.addEventListener('load', () => {
    var word = Word.load();
    document.getElementById("button")!.onclick = () => { word.add(randomColor()) };
});
