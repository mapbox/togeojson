import { isElement, nodeVal } from "../shared";

export type ExtendedValues = [string, string | number][];

export function getExtensions(node: Element | null): ExtendedValues {
  let values: [string, string | number][] = [];
  if (node === null) return values;
  for (const child of Array.from(node.childNodes)) {
    if (!isElement(child)) continue;
    const name = abbreviateName(child.nodeName);
    if (name === "gpxtpx:TrackPointExtension") {
      // loop again for nested garmin extensions (eg. "gpxtpx:hr")
      values = values.concat(getExtensions(child));
    } else {
      // push custom extension (eg. "power")
      const val = nodeVal(child);
      values.push([name, parseNumeric(val)]);
    }
  }
  return values;
}

function abbreviateName(name: string) {
  return ["heart", "gpxtpx:hr", "hr"].includes(name) ? "heart" : name;
}

function parseNumeric(val: string) {
  const num = parseFloat(val);
  return isNaN(num) ? val : num;
}
