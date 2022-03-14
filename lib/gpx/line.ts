import { get, P, val1, $num } from "../shared";

export function getLineStyle(node: Element | null) {
  return get(node, "line", (lineStyle) => {
    const val: P = Object.assign(
      {},
      val1(lineStyle, "color", (color) => {
        return { stroke: `#${color}` };
      }),
      $num(lineStyle, "opacity", (opacity) => {
        return { "stroke-opacity": opacity };
      }),
      $num(lineStyle, "width", (width) => {
        // GPX width is in mm, convert to px with 96 px per inch
        return { "stroke-width": (width * 96) / 25.4 };
      })
    );
    return val;
  });
}
