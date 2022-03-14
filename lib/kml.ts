import { extractStyle } from "./kml/extractStyle";
import { getPlacemark } from "./kml/placemark";
import { FeatureCollection, Geometry } from "geojson";
import {
  $,
  StyleMap,
  P,
  F,
  val1,
  nodeVal,
  isElement,
  normalizeId,
} from "./shared";

interface Folder {
  type: "folder";
  meta: {
    name?: string;
    visibility?: string;
    description?: string;
  };
  children: Array<Folder | F>;
}

/**
 * A nested folder structure, represented
 * as a tree with folders and features.
 */
export interface Root {
  type: "root";
  children: Array<Folder | F>;
}

type TreeContainer = Root | Folder;

function getStyleId(style: Element) {
  let id = style.getAttribute("id");
  const parentNode = style.parentNode;
  if (
    !id &&
    isElement(parentNode) &&
    parentNode.localName === "CascadingStyle"
  ) {
    id = parentNode.getAttribute("kml:id") || parentNode.getAttribute("id");
  }
  return normalizeId(id || "");
}

function buildStyleMap(node: Document): StyleMap {
  const styleMap: StyleMap = {};
  for (const style of $(node, "Style")) {
    styleMap[getStyleId(style)] = extractStyle(style);
  }
  for (const map of $(node, "StyleMap")) {
    const id = normalizeId(map.getAttribute("id") || "");
    val1(map, "styleUrl", (styleUrl) => {
      styleUrl = normalizeId(styleUrl);
      if (styleMap[styleUrl]) {
        styleMap[id] = styleMap[styleUrl];
      }
    });
  }
  return styleMap;
}

function getFolder(node: Element): Folder {
  const props = [
    "name",
    "visibility",
    "open",
    "address",
    "description",
    "phoneNumber",
    "visibility",
  ];
  const meta: P = {};

  for (const child of Array.from(node.childNodes)) {
    if (isElement(child) && props.includes(child.tagName)) {
      meta[child.tagName] = nodeVal(child);
    }
  }

  return {
    type: "folder",
    meta,
    children: [],
  };
}

/**
 * Yield a nested tree with KML folder structure
 *
 * This generates a tree with the given structure:
 *
 * ```js
 * {
 *   "type": "root",
 *   "children": [
 *     {
 *       "type": "folder",
 *       "meta": {
 *         "name": "Test"
 *       },
 *       "children": [
 *          // ...features and folders
 *       ]
 *     }
 *     // ...features
 *   ]
 * }
 * ```
 */
export function kmlWithFolders(node: Document): Root {
  const styleMap = buildStyleMap(node);

  // atomic geospatial types supported by KML - MultiGeometry is
  // handled separately
  // all root placemarks in the file
  const placemarks = [];
  const tree: Root = { type: "root", children: [] };

  function traverse(
    node: Document | ChildNode | Element,
    pointer: TreeContainer
  ) {
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i], pointer);
      }
    }

    if (!isElement(node)) return;

    switch (node.tagName) {
      case "Placemark": {
        placemarks.push(node);
        const placemark = getPlacemark(node, styleMap);
        if (placemark) {
          pointer.children.push(placemark);
        }
        break;
      }
      case "Folder": {
        const folder = getFolder(node);
        pointer.children.push(folder);
        pointer = folder;
        break;
      }
    }
  }

  traverse(node, tree);

  return tree;
}

/**
 * Convert KML to GeoJSON incrementally, returning
 * a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
 * that yields output feature by feature.
 */
export function* kmlGen(node: Document): Generator<F> {
  const styleMap = buildStyleMap(node);
  for (const placemark of $(node, "Placemark")) {
    const feature = getPlacemark(placemark, styleMap);
    if (feature) yield feature;
  }
}

/**
 * Convert a KML document to GeoJSON. The first argument, `doc`, must be a KML
 * document as an XML DOM - not as a string. You can get this using jQuery's default
 * `.ajax` function or using a bare XMLHttpRequest with the `.response` property
 * holding an XML DOM.
 *
 * The output is a JavaScript object of GeoJSON data. You can convert it to a string
 * with [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
 * or use it directly in libraries.
 */
export function kml(node: Document): FeatureCollection<Geometry | null> {
  return {
    type: "FeatureCollection",
    features: Array.from(kmlGen(node)),
  };
}
