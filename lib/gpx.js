import { nodeVal, get1 } from "./shared.js";

const EXTENSIONS_NS = "http://www.garmin.com/xmlschemas/GpxExtensions/v3";

const META_PROPERTIES = ["name", "cmt", "desc", "type", "time", "keywords"];

function getLineStyle(extensions) {
  const style = {};
  if (extensions) {
    const lineStyle = get1(extensions, "line");
    if (lineStyle) {
      const color = nodeVal(get1(lineStyle, "color")),
        opacity = parseFloat(nodeVal(get1(lineStyle, "opacity"))),
        width = parseFloat(nodeVal(get1(lineStyle, "width")));
      if (color) style.stroke = color;
      if (!isNaN(opacity)) style["stroke-opacity"] = opacity;
      // GPX width is in mm, convert to px with 96 px per inch
      if (!isNaN(width)) style["stroke-width"] = (width * 96) / 25.4;
    }
  }
  return style;
}

/**
 * Extract point extensions (eg. "trkpt > extensions > *")
 */
function getExtensions(node) {
  const values = [];
  if (node !== null) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      // see: https://github.com/mapbox/geojson-coordinate-properties
      const name = ["heart", "gpxtpx:hr", "hr"].includes(child.nodeName)
        ? "heart"
        : child.nodeName;
      // loop child nodes (node.js and browser compatibile)
      if (child.nodeType === 1) {
        if (name == "gpxtpx:TrackPointExtension") {
          // loop again for nested garmin extensions (eg. "gpxtpx:hr")
          values.push.apply(values, getExtensions(child));
        } else {
          // push custom extension (eg. "power")
          const val = nodeVal(child);
          values.push([name, isNaN(val) ? val : parseFloat(val)]);
        }
      }
    }
  }
  return values;
}

/**
 * Get the contents of multiple text nodes, if present
 */
function getMulti(x, ys) {
  const o = {};
  let n;
  let k;
  for (k = 0; k < ys.length; k++) {
    n = get1(x, ys[k]);
    if (n) o[ys[k]] = nodeVal(n);
  }
  return o;
}

/**
 * Extract common node properties (eg. gpx file metadata, point extensions, ...)
 */
function getProperties(node) {
  const prop = getMulti(node, META_PROPERTIES);
  // Parse additional data from our Garmin extension(s)
  const extensions = node.getElementsByTagNameNS(EXTENSIONS_NS, "*");
  for (let i = 0; i < extensions.length; i++) {
    const extension = extensions[i];
    // Ignore nested extensions, like those on routepoints or trackpoints
    if (extension.parentNode.parentNode === node) {
      prop[extension.tagName.replace(":", "_")] = nodeVal(extension);
    }
  }
  const links = node.getElementsByTagName("link");
  if (links.length) prop.links = [];
  for (let i = 0; i < links.length; i++) {
    prop.links.push(
      Object.assign(
        { href: links[i].getAttribute("href") },
        getMulti(links[i], ["text", "type"])
      )
    );
  }
  return prop;
}

function coordPair(x) {
  const ll = [
    parseFloat(x.getAttribute("lon")),
    parseFloat(x.getAttribute("lat")),
  ];
  const ele = get1(x, "ele");
  const time = get1(x, "time");
  const e = ele ? parseFloat(nodeVal(ele)) : "NaN";
  if (!isNaN(e)) {
    ll.push(e);
  }
  return {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    extensions: getExtensions(get1(x, "extensions")),
  };
}
function getRoute(node) {
  const line = getPoints(node, "rtept");
  if (!line) return;
  return {
    type: "Feature",
    properties: Object.assign(
      getProperties(node),
      getLineStyle(get1(node, "extensions")),
      { _gpxType: "rte" }
    ),
    geometry: {
      type: "LineString",
      coordinates: line.line,
    },
  };
}

function getPoints(node, pointname) {
  const pts = node.getElementsByTagName(pointname);
  if (pts.length < 2) return; // Invalid line in GeoJSON

  const line = [];
  const times = [];
  const extendedValues = {};
  for (let i = 0; i < pts.length; i++) {
    const c = coordPair(pts[i]);
    line.push(c.coordinates);
    if (c.time) times.push(c.time);
    for (let j = 0; j < c.extensions.length; j++) {
      const [name, val] = c.extensions[j];
      // pluralize names and strips garmin prefix
      const propname =
        name === "heart" ? name : name.replace("gpxtpx:", "") + "s";
      if (!extendedValues[propname]) {
        extendedValues[propname] = Array(pts.length).fill(null);
      }
      extendedValues[propname][i] = val;
    }
  }
  return {
    line: line,
    times: times,
    extendedValues: extendedValues,
  };
}

function getTrack(node) {
  const segments = node.getElementsByTagName("trkseg");
  const track = [];
  const times = [];
  const lines = [];

  for (let i = 0; i < segments.length; i++) {
    const line = getPoints(segments[i], "trkpt");
    if (line) {
      lines.push(line);
      if (line.times && line.times.length) times.push(line.times);
    }
  }

  if (lines.length === 0) return;

  const multi = lines.length > 1;

  const properties = Object.assign(
    getProperties(node),
    getLineStyle(get1(node, "extensions")),
    { _gpxType: "trk" },
    times.length
      ? {
          coordinateProperties: {
            times: multi ? times : times[0],
          },
        }
      : {}
  );

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    track.push(line.line);
    for (const [name, val] of Object.entries(line.extendedValues)) {
      if (!properties.coordinateProperties) {
        properties.coordinateProperties = {};
      }
      const props = properties.coordinateProperties;
      if (multi) {
        if (!props[name]) {
          props[name] = lines.map((line) =>
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

function getPoint(node) {
  return {
    type: "Feature",
    properties: Object.assign(getProperties(node), getMulti(node, ["sym"])),
    geometry: {
      type: "Point",
      coordinates: coordPair(node).coordinates,
    },
  };
}

export function* gpxGen(doc) {
  const tracks = doc.getElementsByTagName("trk");
  const routes = doc.getElementsByTagName("rte");
  const waypoints = doc.getElementsByTagName("wpt");

  for (let i = 0; i < tracks.length; i++) {
    const feature = getTrack(tracks[i]);
    if (feature) yield feature;
  }
  for (let i = 0; i < routes.length; i++) {
    const feature = getRoute(routes[i]);
    if (feature) yield feature;
  }
  for (let i = 0; i < waypoints.length; i++) {
    yield getPoint(waypoints[i]);
  }
}

export function gpx(doc) {
  return {
    type: "FeatureCollection",
    features: Array.from(gpxGen(doc)),
  };
}
