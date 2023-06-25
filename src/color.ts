namespace Color {
  export type RGB = [r: number, g: number, b: number]; // legacy
  export type HEX = string;

  export function rgbToHex(rgb: RGB): HEX {
    return rgb.map((byte) => byte.toString(16).padStart(16)).join("");
  }
  export function random(): HEX {
    let num = Math.floor(Math.random() * 16777216);
    return num.toString(16).padStart(6, "0");
  }
}
