import { nodeVal, get1 } from "./shared.js";

const EXTENSIONS_NS = "http://www.garmin.com/xmlschemas/ActivityExtension/v2";

/**
 * @type {[string, string][]}
 */
const TRACKPOINT_ATTRIBUTES = [
  ["heartRate", "heartRates"],
  ["Cadence", "cadences"],
  // Extended Trackpoint attributes
  ["Speed", "speeds"],
  ["Watts", "watts"],
];

/**
 * @type {[string, string][]}
 */
const LAP_ATTRIBUTES = [
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

/**
 * @param {[string, unknown][]} arr
 */
function fromEntries(arr) {
  /** @type {{ [key: string]: unknown }} */
  const obj = {};
  for (const [key, value] of arr) {
    obj[key] = value;
  }
  return obj;
}

/**
 * @param {Element} node
 * @param {[string, string][]} attributeNames
 *
 * @returns {[string, unknown][]}
 */
function getProperties(node, attributeNames) {
  /**
   * @type {[string, unknown][]}
   */
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

/**
 * @param {Element} x
 */
function coordPair(x) {
  const lon = nodeVal(get1(x, "LongitudeDegrees"));
  const lat = nodeVal(get1(x, "LatitudeDegrees"));
  if (!lon.length || !lat.length) {
    return null;
  }
  const ll = [parseFloat(lon), parseFloat(lat)];
  const alt = get1(x, "AltitudeMeters");
  const heartRate = get1(x, "HeartRateBpm");
  const time = get1(x, "Time");
  let a;
  if (alt) {
    a = parseFloat(nodeVal(alt));
    if (!isNaN(a)) {
      ll.push(a);
    }
  }
  return {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null,
    extensions: getProperties(x, TRACKPOINT_ATTRIBUTES),
  };
}

/**
 * @param {Element} node
 * @param {string} pointname
 */
function getPoints(node, pointname) {
  const pts = node.getElementsByTagName(pointname);
  const line = [];
  const times = [];
  const heartRates = [];
  if (pts.length < 2) return null; // Invalid line in GeoJSON
  const result = { extendedProperties: {} };
  for (let i = 0; i < pts.length; i++) {
    const c = coordPair(pts[i]);
    if (c === null) continue;
    line.push(c.coordinates);
    if (c.time) times.push(c.time);
    if (c.heartRate) heartRates.push(c.heartRate);
    for (const [alias, value] of c.extensions) {
      if (!result.extendedProperties[alias]) {
        result.extendedProperties[alias] = Array(pts.length).fill(null);
      }
      result.extendedProperties[alias][i] = value;
    }
  }
  return Object.assign(result, {
    line: line,
    times: times,
    heartRates: heartRates,
  });
}

/**
 * @param {Element} node
 */
function getLap(node) {
  const segments = node.getElementsByTagName("Track");
  const track = [];
  const times = [];
  const heartRates = [];
  const allExtendedProperties = [];
  let line;
  const properties = fromEntries(getProperties(node, LAP_ATTRIBUTES));

  const nameElement = get1(node, "Name");
  if (nameElement) {
    properties.name = nodeVal(nameElement);
  }

  for (let i = 0; i < segments.length; i++) {
    line = getPoints(segments[i], "Trackpoint");
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
        properties[property] = line.extendedProperties[property];
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
  if (track.length === 0) return;

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
    geometry: {
      type: track.length === 1 ? "LineString" : "MultiLineString",
      coordinates: track.length === 1 ? track[0] : track,
    },
  };
}

/**
 * @param {Element} doc
 */
export function* tcxGen(doc) {
  const laps = doc.getElementsByTagName("Lap");

  for (let i = 0; i < laps.length; i++) {
    const feature = getLap(laps[i]);
    if (feature) yield feature;
  }

  const courses = doc.getElementsByTagName("Courses");

  for (let i = 0; i < courses.length; i++) {
    const feature = getLap(courses[i]);
    if (feature) yield feature;
  }
}

/**
 * @param {Element} doc
 */
export function tcx(doc) {
  return {
    type: "FeatureCollection",
    features: Array.from(tcxGen(doc)),
  };
}
