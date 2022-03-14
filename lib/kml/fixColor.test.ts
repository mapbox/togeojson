import { fixColor } from "./fixColor";

describe("fixColor", () => {
  it("passes-through CSS colors", () => {
    expect(fixColor("#f00", "line")).toEqual({
      "line-color": "#f00",
    });
    expect(fixColor("#f00f00", "line")).toEqual({
      "line-color": "#f00f00",
    });
  });
  it("rearranges KML colors", () => {
    expect(fixColor("#000f0000", "line")).toEqual({
      "line-color": "#00000f",
      "line-opacity": 0,
    });
    expect(fixColor("#ff000000", "line")).toEqual({
      "line-color": "#000000",
      "line-opacity": 1,
    });
    expect(fixColor("ff000000", "line")).toEqual({
      "line-color": "#000000",
      "line-opacity": 1,
    });
    expect(fixColor("#a1ff00ff", "line")).toEqual({
      "line-color": "#ff00ff",
      "line-opacity": 0.6313725490196078,
    });
  });
});
