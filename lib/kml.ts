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

/**
 * A folder including metadata. Folders
 * may contain other folders or features,
 * or nothing at all.
 */
export interface Folder {
  type: "folder";
  /**
   * Standard values:
   *
   * * "name",
   * * "visibility",
   * * "open",
   * * "address",
   * * "description",
   * * "phoneNumber",
   * * "visibility",
   */
  meta: {
    [key: string]: unknown;
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

const FOLDER_PROPS = [
  "name",
  "visibility",
  "open",
  "address",
  "description",
  "phoneNumber",
  "visibility",
] as const;

function getFolder(node: Element): Folder {
  const meta: P = {};

  for (const child of Array.from(node.childNodes)) {
    if (isElement(child) && FOLDER_PROPS.includes(child.tagName as any)) {
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
    if (isElement(node)) {
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

    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i], pointer);
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
