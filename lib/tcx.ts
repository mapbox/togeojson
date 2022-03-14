import { Feature, FeatureCollection, Position } from "geojson";
import { P, $, get, num1, nodeVal, get1 } from "./shared";

type PropertyMapping = readonly [string, string][];

const EXTENSIONS_NS = "http://www.garmin.com/xmlschemas/ActivityExtension/v2";

const TRACKPOINT_ATTRIBUTES: PropertyMapping = [
  ["heartRate", "heartRates"],
  ["Cadence", "cadences"],
  // Extended Trackpoint attributes
  ["Speed", "speeds"],
  ["Watts", "watts"],
];

const LAP_ATTRIBUTES: PropertyMapping = [
  ["TotalTimeSeconds", "totalTimeSeconds"],
  ["DistanceMeters", "distanceMeters"],
  ["MaximumSpeed", "maxSpeed"],
  ["AverageHeartRateBpm", "avgHeartRate"],
  ["MaximumHeartRateBpm", "maxHeartRate"],

  // Extended Lap attributes
  ["AvgSpeed", "avgSpeed"],
  ["AvgWatts", "avgWatts"],
  ["MaxWatts", "maxWatts"],
];

function getProperties(node: Element, attributeNames: PropertyMapping) {
  const properties = [];

  for (const [tag, alias] of attributeNames) {
    let elem = get1(node, tag);
    if (!elem) {
      const elements = node.getElementsByTagNameNS(EXTENSIONS_NS, tag);
      if (elements.length) {
        elem = elements[0];
      }
    }
    const val = parseFloat(nodeVal(elem));
    if (!isNaN(val)) {
      properties.push([alias, val]);
    }
  }

  return properties;
}

function coordPair(node: Element) {
  const ll = [num1(node, "LongitudeDegrees"), num1(node, "LatitudeDegrees")];
  if (
    ll[0] === undefined ||
    isNaN(ll[0]) ||
    ll[1] === undefined ||
    isNaN(ll[1])
  ) {
    return null;
  }
  const heartRate = get1(node, "HeartRateBpm");
  const time = nodeVal(get1(node, "Time"));
  get1(node, "AltitudeMeters", (alt) => {
    const a = parseFloat(nodeVal(alt));
    if (!isNaN(a)) {
      ll.push(a);
    }
  });
  return {
    coordinates: ll as number[],
    time: time || null,
    heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null,
    extensions: getProperties(node, TRACKPOINT_ATTRIBUTES),
  };
}

function getPoints(node: Element) {
  const pts = $(node, "Trackpoint");
  const line: Position[] = [];
  const times = [];
  const heartRates = [];
  if (pts.length < 2) return null; // Invalid line in GeoJSON
  const extendedProperties: P = {};
  const result = { extendedProperties };
  for (let i = 0; i < pts.length; i++) {
    const c = coordPair(pts[i]);
    if (c === null) continue;
    line.push(c.coordinates);
    const { time, heartRate, extensions } = c;
    if (time) times.push(time);
    if (heartRate) heartRates.push(heartRate);
    for (const [alias, value] of extensions) {
      if (!extendedProperties[alias]) {
        extendedProperties[alias] = Array(pts.length).fill(null);
      }
      extendedProperties[alias][i] = value;
    }
  }
  return Object.assign(result, {
    line: line,
    times: times,
    heartRates: heartRates,
  });
}

function getLap(node: Element): Feature | null {
  const segments = $(node, "Track");
  const track = [];
  const times = [];
  const heartRates = [];
  const allExtendedProperties = [];
  let line;
  const properties: P = Object.assign(
    Object.fromEntries(getProperties(node, LAP_ATTRIBUTES)),
    get(node, "Name", (nameElement) => {
      return { name: nodeVal(nameElement) };
    })
  );

  for (const segment of segments) {
    line = getPoints(segment);
    if (line) {
      track.push(line.line);
      if (line.times.length) times.push(line.times);
      if (line.heartRates.length) heartRates.push(line.heartRates);
      allExtendedProperties.push(line.extendedProperties);
    }
  }
  for (let i = 0; i < allExtendedProperties.length; i++) {
    const extendedProperties = allExtendedProperties[i];
    for (const property in extendedProperties) {
      if (segments.length === 1) {
        if (line) {
          properties[property] = line.extendedProperties[property];
        }
      } else {
        if (!properties[property]) {
          properties[property] = track.map((track) =>
            Array(track.length).fill(null)
          );
        }
        properties[property][i] = extendedProperties[property];
      }
    }
  }

  if (track.length === 0) return null;

  if (times.length || heartRates.length) {
    properties.coordinateProperties = Object.assign(
      times.length
        ? {
            times: track.length === 1 ? times[0] : times,
          }
        : {},
      heartRates.length
        ? {
            heart: track.length === 1 ? heartRates[0] : heartRates,
          }
        : {}
    );
  }

  return {
    type: "Feature",
    properties: properties,
    geometry:
      track.length === 1
        ? {
            type: "LineString",
            coordinates: track[0],
          }
        : {
            type: "MultiLineString",
            coordinates: track,
          },
  };
}

/**
 * Incrementally convert a TCX document to GeoJSON. The
 * first argument, `doc`, must be a TCX
 * document as an XML DOM - not as a string.
 */
export function* tcxGen(node: Document): Generator<Feature> {
  for (const lap of $(node, "Lap")) {
    const feature = getLap(lap);
    if (feature) yield feature;
  }

  for (const course of $(node, "Courses")) {
    const feature = getLap(course);
    if (feature) yield feature;
  }
}

/**
 * Convert a TCX document to GeoJSON. The first argument, `doc`, must be a TCX
 * document as an XML DOM - not as a string.
 */
export function tcx(node: Document): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: Array.from(tcxGen(node)),
  };
}
