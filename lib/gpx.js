import { nodeVal } from "./shared";

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

// get the contents of multiple text nodes, if present
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
function getProperties(node) {
  const prop = getMulti(node, [
    "name",
    "cmt",
    "desc",
    "type",
    "time",
    "keywords",
  ]);
  // Parse additional data from our Garmin extension(s)
  const extensions = node.getElementsByTagNameNS(
    "http://www.garmin.com/xmlschemas/GpxExtensions/v3",
    "*"
  );
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

// one Y child of X, if any, otherwise null
function get1(x, y) {
  const n = x.getElementsByTagName(y);
  return n.length ? n[0] : null;
}

function coordPair(x) {
  const ll = [
    parseFloat(x.getAttribute("lon")),
    parseFloat(x.getAttribute("lat")),
  ];
  const ele = get1(x, "ele");
  // handle namespaced attribute in browser
  const heartRate = get1(x, "gpxtpx:hr") || get1(x, "hr");
  const time = get1(x, "time");
  let e;
  if (ele) {
    e = parseFloat(nodeVal(ele));
    if (!isNaN(e)) {
      ll.push(e);
    }
  }
  const result = {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    extendedValues: [],
  };

  if (heartRate) {
    result.extendedValues.push(["heartRate", parseFloat(nodeVal(heartRate))]);
  }

  const extensions = get1(x, "extensions");
  if (extensions !== null) {
    for (const name of ["speed", "course", "hAcc", "vAcc"]) {
      const v = parseFloat(nodeVal(get1(extensions, name)));
      if (!isNaN(v)) {
        result.extendedValues.push([name, v]);
      }
    }
  }
  return result;
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
    for (let j = 0; j < c.extendedValues.length; j++) {
      const [name, val] = c.extendedValues[j];
      const plural = name + "s";
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

function getTrack(node) {
  const segments = node.getElementsByTagName("trkseg");
  const track = [];
  const times = [];
  const extractedLines = [];

  for (let i = 0; i < segments.length; i++) {
    const line = getPoints(segments[i], "trkpt");
    if (line) {
      extractedLines.push(line);
      if (line.times && line.times.length) times.push(line.times);
    }
  }

  if (extractedLines.length === 0) return;

  const multi = extractedLines.length > 1;

  const properties = Object.assign(
    getProperties(node),
    getLineStyle(get1(node, "extensions")),
    { _gpxType: "trk" },
    times.length
      ? {
          coordTimes: multi ? times : times[0],
        }
      : {}
  );

  for (let i = 0; i < extractedLines.length; i++) {
    const line = extractedLines[i];
    track.push(line.line);
    for (const [name, val] of Object.entries(line.extendedValues)) {
      if (multi) {
        if (!properties[name])
          properties[name] = extractedLines.map((line) =>
            new Array(line.line.length).fill(null)
          );
        properties[name][i] = val;
      } else {
        properties[name] = val;
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
