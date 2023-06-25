namespace Color {
  export type RGB = [r: number, g: number, b: number]; // legacy
  export type HEX = string;

  export function rgbToHex(rgb: RGB): HEX {
    let r = rgb[0].toString(16).padStart(2, "0");
    let g = rgb[1].toString(16).padStart(2, "0");
    let b = rgb[2].toString(16).padStart(2, "0");
    return `${r}${g}${b}`;
  }
  export function random(): HEX {
    let num = Math.floor(Math.random() * 16777216);
    return num.toString(16).padStart(6, "0");
  }
}
