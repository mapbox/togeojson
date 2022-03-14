import { Position } from "geojson";
import { num1, get1, nodeVal } from "../shared";
import { ExtendedValues, getExtensions } from "./extensions";

interface CoordPair {
  coordinates: Position;
  time: string | null;
  extendedValues: ExtendedValues;
}

export function coordPair(node: Element): CoordPair {
  const ll = [
    parseFloat(node.getAttribute("lon") || ""),
    parseFloat(node.getAttribute("lat") || ""),
  ];

  num1(node, "ele", (val) => {
    ll.push(val);
  });

  const time = get1(node, "time");
  return {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    extendedValues: getExtensions(get1(node, "extensions")),
  };
}
