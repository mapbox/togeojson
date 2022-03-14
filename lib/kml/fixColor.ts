import { P } from "../shared";

export function fixColor(v: string, prefix: string): P {
  const properties: P = {};
  const colorProp =
    prefix == "stroke" || prefix === "fill" ? prefix : prefix + "-color";
  if (v[0] === "#") {
    v = v.substring(1);
  }
  if (v.length === 6 || v.length === 3) {
    properties[colorProp] = "#" + v;
  } else if (v.length === 8) {
    properties[prefix + "-opacity"] = parseInt(v.substring(0, 2), 16) / 255;
    properties[colorProp] =
      "#" + v.substring(6, 8) + v.substring(4, 6) + v.substring(2, 4);
  }
  return properties;
}
