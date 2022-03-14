import { Feature, Geometry } from "geojson";
import {
  StyleMap,
  P,
  $,
  get,
  get1,
  getMulti,
  nodeVal,
  normalizeId,
  val1,
} from "../shared";
import { extractStyle } from "./extractStyle";
import { getGeometry } from "./geometry";

function extractExtendedData(node: Element) {
  return get(node, "ExtendedData", (extendedData, properties) => {
    for (const data of $(extendedData, "Data")) {
      properties[data.getAttribute("name") || ""] = nodeVal(
        get1(data, "value")
      );
    }
    for (const simpleData of $(extendedData, "SimpleData")) {
      properties[simpleData.getAttribute("name") || ""] = nodeVal(simpleData);
    }
    return properties;
  });
}

function geometryListToGeometry(geometries: Geometry[]): Geometry | null {
  return geometries.length === 0
    ? null
    : geometries.length === 1
    ? geometries[0]
    : {
        type: "GeometryCollection",
        geometries,
      };
}

function extractTimeSpan(node: Element): P {
  return get(node, "TimeSpan", (timeSpan) => {
    return {
      timespan: {
        begin: nodeVal(get1(timeSpan, "begin")),
        end: nodeVal(get1(timeSpan, "end")),
      },
    };
  });
}

function extractTimeStamp(node: Element): P {
  return get(node, "TimeStamp", (timeStamp) => {
    return { timestamp: nodeVal(get1(timeStamp, "when")) };
  });
}

function extractCascadedStyle(node: Element, styleMap: StyleMap): P {
  return val1(node, "styleUrl", (styleUrl) => {
    styleUrl = normalizeId(styleUrl);
    if (styleMap[styleUrl]) {
      return Object.assign({ styleUrl }, styleMap[styleUrl]);
    }
    // For backward-compatibility. Should we still include
    // styleUrl even if it's not resolved?
    return { styleUrl };
  });
}

export function getPlacemark(
  node: Element,
  styleMap: StyleMap
): Feature<Geometry | null> {
  const { coordTimes, geometries } = getGeometry(node);

  const feature: Feature<Geometry | null> = {
    type: "Feature",
    geometry: geometryListToGeometry(geometries),
    properties: Object.assign(
      getMulti(node, [
        "name",
        "address",
        "visibility",
        "open",
        "phoneNumber",
        "description",
      ]),
      extractCascadedStyle(node, styleMap),
      extractStyle(node),
      extractExtendedData(node),
      extractTimeSpan(node),
      extractTimeStamp(node),
      coordTimes.length
        ? {
            coordinateProperties: {
              times: coordTimes.length === 1 ? coordTimes[0] : coordTimes,
            },
          }
        : {}
    ),
  };

  const id = node.getAttribute("id");
  if (id !== null && id !== "") feature.id = id;
  return feature;
}
