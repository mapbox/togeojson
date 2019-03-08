import { nodeVal } from "./shared";

function initializeArray(arr, size) {
  for (let h = 0; h < size; h++) {
    arr.push(null);
  }
  return arr;
}

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
    "keywords"
  ]);
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
    parseFloat(x.getAttribute("lat"))
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
  return {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null
  };
}
function getRoute(node) {
  const line = getPoints(node, "rtept");
  if (!line.line) return;
  return {
    type: "Feature",
    properties: Object.assign(
      getProperties(node),
      getLineStyle(get1(node, "extensions"))
    ),
    geometry: {
      type: "LineString",
      coordinates: line.line
    }
  };
}
function getPoints(node, pointname) {
  const pts = node.getElementsByTagName(pointname);
  const line = [];
  const times = [];
  const heartRates = [];
  const l = pts.length;
  if (l < 2) return {}; // Invalid line in GeoJSON
  for (let i = 0; i < l; i++) {
    const c = coordPair(pts[i]);
    line.push(c.coordinates);
    if (c.time) times.push(c.time);
    if (c.heartRate || heartRates.length) {
      if (!heartRates.length) initializeArray(heartRates, i);
      heartRates.push(c.heartRate || null);
    }
  }
  return {
    line: line,
    times: times,
    heartRates: heartRates
  };
}
function getTrack(node) {
  const segments = node.getElementsByTagName("trkseg");
  const track = [];
  const times = [];
  const heartRates = [];
  let line;
  for (let i = 0; i < segments.length; i++) {
    line = getPoints(segments[i], "trkpt");
    if (line) {
      if (line.line) track.push(line.line);
      if (line.times && line.times.length) times.push(line.times);
      if (heartRates.length || (line.heartRates && line.heartRates.length)) {
        if (!heartRates.length) {
          for (let s = 0; s < i; s++) {
            heartRates.push(initializeArray([], track[s].length));
          }
        }
        if (line.heartRates && line.heartRates.length) {
          heartRates.push(line.heartRates);
        } else {
          heartRates.push(initializeArray([], line.line.length || 0));
        }
      }
    }
  }
  if (track.length === 0) return;
  const properties = Object.assign(
    getProperties(node),
    getLineStyle(get1(node, "extensions"))
  );
  if (times.length)
    properties.coordTimes = track.length === 1 ? times[0] : times;
  if (heartRates.length)
    properties.heartRates = track.length === 1 ? heartRates[0] : heartRates;
  return {
    type: "Feature",
    properties: properties,
    geometry: {
      type: track.length === 1 ? "LineString" : "MultiLineString",
      coordinates: track.length === 1 ? track[0] : track
    }
  };
}

function getPoint(node) {
  return {
    type: "Feature",
    properties: Object.assign(getProperties(node), getMulti(node, ["sym"])),
    geometry: {
      type: "Point",
      coordinates: coordPair(node).coordinates
    }
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
    features: Array.from(gpxGen(doc))
  };
}
