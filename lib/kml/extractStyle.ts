import { P, get, num1, nodeVal, val1 } from "../shared";
import { fixColor } from "./fixColor";

function numericProperty(node: Element, source: string, target: string): P {
  const properties: P = {};
  num1(node, source, (val) => {
    properties[target] = val;
  });
  return properties;
}

function getColor(node: Element, output: string): P {
  return get(node, "color", (elem) => fixColor(nodeVal(elem), output));
}

export function extractIcon(node: Element) {
  return get(node, "IconStyle", (iconStyle) => {
    return Object.assign(
      getColor(node, "icon"),
      numericProperty(iconStyle, "scale", "icon-scale"),
      numericProperty(iconStyle, "heading", "icon-heading"),
      get(iconStyle, "hotSpot", (hotspot) => {
        const left = parseFloat(hotspot.getAttribute("x") || "");
        const top = parseFloat(hotspot.getAttribute("y") || "");
        if (!isNaN(left) && !isNaN(top)) return { "icon-offset": [left, top] };
        return {};
      }),
      get(iconStyle, "Icon", (icon, properties) => {
        val1(icon, "href", (href) => {
          properties.icon = href;
        });
        return properties;
      })
    );
  });
}

export function extractLabel(node: Element) {
  return get(node, "LabelStyle", (labelStyle) => {
    return Object.assign(
      getColor(node, "label"),
      numericProperty(labelStyle, "scale", "label-scale")
    );
  });
}

export function extractLine(node: Element) {
  return get(node, "LineStyle", (lineStyle) => {
    return Object.assign(
      getColor(node, "stroke"),
      numericProperty(lineStyle, "width", "stroke-width")
    );
  });
}

export function extractPoly(node: Element) {
  return get(node, "PolyStyle", (polyStyle, properties) => {
    return Object.assign(
      properties,
      get(polyStyle, "color", (elem) => fixColor(nodeVal(elem), "fill")),
      val1(polyStyle, "fill", (fill) => {
        if (fill === "0") return { "fill-opacity": 0 };
      }),
      val1(polyStyle, "outline", (outline) => {
        if (outline === "0") return { "stroke-opacity": 0 };
      })
    );
  });
}

export function extractStyle(node: Element) {
  return Object.assign(
    {},
    extractPoly(node),
    extractLine(node),
    extractLabel(node),
    extractIcon(node)
  );
}
