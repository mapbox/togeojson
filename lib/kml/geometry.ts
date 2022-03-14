import { Position, Point, LineString, Geometry } from "geojson";
import { $, $ns, nodeVal, get1 } from "../shared";

const removeSpace = /\s*/g;
const trimSpace = /^\s*|\s*$/g;
const splitSpace = /\s+/;

/**
 * Get one coordinate from a coordinate array, if any
 */
export function coord1(value: string): Position {
  return value
    .replace(removeSpace, "")
    .split(",")
    .map(parseFloat)
    .filter((num) => !isNaN(num));
}

/**
 * Get all coordinates from a coordinate array as [[],[]]
 */
export function coord(value: string): Position[] {
  return value
    .replace(trimSpace, "")
    .split(splitSpace)
    .map(coord1)
    .filter((coord) => {
      return coord.length >= 2;
    });
}

function gxCoords(
  node: Element
): { geometry: Point | LineString; times: string[] } | null {
  let elems = $(node, "coord");
  if (elems.length === 0) {
    elems = $ns(node, "coord", "*");
  }

  const coordinates = elems.map((elem) => {
    return nodeVal(elem).split(" ").map(parseFloat);
  });

  if (coordinates.length === 0) {
    return null;
  }

  return {
    geometry:
      coordinates.length > 2
        ? {
            type: "LineString",
            coordinates,
          }
        : {
            type: "Point",
            coordinates: coordinates[0],
          },
    times: $(node, "when").map((elem) => nodeVal(elem)),
  };
}

export function fixRing(ring: Position[]) {
  if (ring.length === 0) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  let equal = true;
  for (let i = 0; i < Math.max(first.length, last.length); i++) {
    if (first[i] !== last[i]) {
      equal = false;
      break;
    }
  }
  if (!equal) {
    return ring.concat([ring[0]]);
  }
  return ring;
}

const GEO_TYPES = [
  "Polygon",
  "LineString",
  "Point",
  "Track",
  "gx:Track",
] as const;

function getCoordinates(node: Element) {
  return nodeVal(get1(node, "coordinates"));
}

interface GeometriesAndTimes {
  geometries: Geometry[];
  coordTimes: string[][];
}

export function getGeometry(node: Element): GeometriesAndTimes {
  const geometries: Geometry[] = [];
  const coordTimes = [];
  for (const t of ["MultiGeometry", "MultiTrack", "gx:MultiTrack"]) {
    const elem = get1(node, t);
    if (elem) {
      return getGeometry(elem);
    }
  }
  for (const geoType of GEO_TYPES) {
    for (const geomNode of $(node, geoType)) {
      switch (geoType) {
        case "Point": {
          const coordinates = coord1(getCoordinates(geomNode));
          if (coordinates.length >= 2) {
            geometries.push({
              type: "Point",
              coordinates,
            });
          }
          break;
        }
        case "LineString": {
          const coordinates = coord(getCoordinates(geomNode));
          if (coordinates.length >= 2) {
            geometries.push({
              type: "LineString",
              coordinates,
            });
          }
          break;
        }
        case "Polygon": {
          const coords = [];
          for (const linearRing of $(geomNode, "LinearRing")) {
            const ring = fixRing(coord(getCoordinates(linearRing)));
            if (ring.length >= 4) {
              coords.push(ring);
            }
          }
          if (coords.length) {
            geometries.push({
              type: "Polygon",
              coordinates: coords,
            });
          }
          break;
        }
        case "Track":
        case "gx:Track": {
          const gx = gxCoords(geomNode);
          if (!gx) break;
          const { times, geometry } = gx;
          geometries.push(geometry);
          if (times.length) coordTimes.push(times);
          break;
        }
      }
    }
  }
  return {
    geometries,
    coordTimes,
  };
}
