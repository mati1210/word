namespace Saving {
  export type CurrentSave = SaveV4;
  export type Save = SaveV2 | SaveV3 | SaveV4;

  interface SaveV2 {
    word: Color.RGB[];
    version: 2;
  }

  interface SaveV3 {
    colors: Color.HEX[];
    version: 3;
  }

  interface SaveV4 {
    word: string;
    colors: Color.HEX[];
    version: 4;
  }

  function v2to3(save: SaveV2): SaveV3 {
    return { colors: save.word.map(Color.rgbToHex), version: 3 };
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
