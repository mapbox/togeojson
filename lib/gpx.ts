import type {
  FeatureCollection,
  Feature,
  Point,
  MultiLineString,
  LineString,
  Position,
} from "geojson";
import { getLineStyle } from "./gpx/line";
import { coordPair } from "./gpx/coord_pair";
import { extractProperties } from "./gpx/properties";
import { P, $, get1, getMulti } from "./shared";

function getPoints(node: Element, pointname: "trkpt" | "rtept") {
  const pts = $(node, pointname);
  if (pts.length < 2) return; // Invalid line in GeoJSON

  const line: Position[] = [];
  const times = [];
  const extendedValues: P = {};
  for (let i = 0; i < pts.length; i++) {
    const c = coordPair(pts[i]);
    line.push(c.coordinates);
    if (c.time) times.push(c.time);
    for (const [name, val] of c.extendedValues) {
      const plural =
        name === "heart" ? name : name.replace("gpxtpx:", "") + "s";
      if (!extendedValues[plural]) {
        extendedValues[plural] = Array(pts.length).fill(null);
      }
      extendedValues[plural][i] = val;
    }
  }

  return {
    line: line,
    times: times,
    extendedValues: extendedValues,
  };
}

function getRoute(node: Element): Feature<LineString> | undefined {
  const line = getPoints(node, "rtept");
  if (!line) return;
  return {
    type: "Feature",
    properties: Object.assign(
      { _gpxType: "rte" },
      extractProperties(node),
      getLineStyle(get1(node, "extensions"))
    ),
    geometry: {
      type: "LineString",
      coordinates: line.line,
    },
  };
}

function getTrack(node: Element): Feature<LineString | MultiLineString> | null {
  const segments = $(node, "trkseg");
  const track = [];
  const times = [];
  const extractedLines = [];

  for (const segment of segments) {
    const line = getPoints(segment, "trkpt");
    if (line) {
      extractedLines.push(line);
      if (line.times && line.times.length) times.push(line.times);
    }
  }

  if (extractedLines.length === 0) return null;

  const multi = extractedLines.length > 1;

  const properties: Feature["properties"] = Object.assign(
    { _gpxType: "trk" },
    extractProperties(node),
    getLineStyle(get1(node, "extensions")),
    times.length
      ? {
          coordinateProperties: {
            times: multi ? times : times[0],
          },
        }
      : {}
  );

  for (const line of extractedLines) {
    track.push(line.line);
    if (!properties.coordinateProperties) {
      properties.coordinateProperties = {};
    }
    const props = properties.coordinateProperties;
    const entries = Object.entries(line.extendedValues);
    for (let i = 0; i < entries.length; i++) {
      const [name, val] = entries[i];
      if (multi) {
        if (!props[name]) {
          props[name] = extractedLines.map((line) =>
            new Array(line.line.length).fill(null)
          );
        }
        props[name][i] = val;
      } else {
        props[name] = val;
      }
    }
  }

  return {
    type: "Feature",
    properties: properties,
    geometry: multi
      ? {
          type: "MultiLineString",
          coordinates: track,
        }
      : {
          type: "LineString",
          coordinates: track[0],
        },
  };
}

function getPoint(node: Element): Feature<Point> {
  const properties: Feature["properties"] = Object.assign(
    extractProperties(node),
    getMulti(node, ["sym"])
  );
  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Point",
      coordinates: coordPair(node).coordinates,
    },
  };
}

/**
 * Convert GPX to GeoJSON incrementally, returning
 * a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
 * that yields output feature by feature.
 */
export function* gpxGen(node: Document): Generator<Feature> {
  for (const track of $(node, "trk")) {
    const feature = getTrack(track);
    if (feature) yield feature;
  }

  for (const route of $(node, "rte")) {
    const feature = getRoute(route);
    if (feature) yield feature;
  }

  for (const waypoint of $(node, "wpt")) {
    yield getPoint(waypoint);
  }
}

/**
 *
 * Convert a GPX document to GeoJSON. The first argument, `doc`, must be a GPX
 * document as an XML DOM - not as a string. You can get this using jQuery's default
 * `.ajax` function or using a bare XMLHttpRequest with the `.response` property
 * holding an XML DOM.
 *
 * The output is a JavaScript object of GeoJSON data, same as `.kml` outputs, with the
 * addition of a `_gpxType` property on each `LineString` feature that indicates whether
 * the feature was encoded as a route (`rte`) or track (`trk`) in the GPX document.
 */
export function gpx(node: Document): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: Array.from(gpxGen(node)),
  };
}
