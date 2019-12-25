import { nodeVal } from "./shared";

const attributeNames = [
  ["speed", "speeds"],
  ["course", "courses"],
  ["hAcc", "hAccs"],
  ["vAcc", "vAccs"],
  ["heartRate", "heartRates"]
];

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
  const result = {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null
  };

  const extensions = get1(x, "extensions");
  if (extensions !== null) {
    attributeNames
      .map(r => r[0])
      .filter(n => n !== "heartrate")
      .forEach(name => {
        const raw = get1(extensions, name);
        if (raw !== null) {
          const v = parseFloat(nodeVal(raw));
          if (!isNaN(v)) {
            result[name] = v;
          }
        }
      });
  }
  return result;
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
  const l = pts.length;
  const extendedValues = {};
  if (l < 2) return {}; // Invalid line in GeoJSON
  for (let i = 0; i < l; i++) {
    const c = coordPair(pts[i]);
    line.push(c.coordinates);
    if (c.time) times.push(c.time);
    attributeNames
      .map(r => r[0])
      .forEach(name => {
        if (c[name] || extendedValues[name]) {
          if (!extendedValues[name]) {
            extendedValues[name] = Array(i).fill(null);
          }
          extendedValues[name].push(c[name] || null);
        }
      });
  }
  const result = {
    line: line,
    times: times
  };
  attributeNames.forEach(n => {
    if (extendedValues[n[0]]) {
      result[n[1]] = extendedValues[n[0]] || [];
    }
  });
  return result;
}
function getTrack(node) {
  const segments = node.getElementsByTagName("trkseg");
  const track = [];
  const times = [];
  const extendedValues = {};
  let line;
  for (let i = 0; i < segments.length; i++) {
    line = getPoints(segments[i], "trkpt");
    if (line) {
      if (line.line) track.push(line.line);
      if (line.times && line.times.length) times.push(line.times);

      attributeNames
        .map(r => r[1])
        .forEach(name => {
          if (
            (extendedValues[name] && extendedValues[name].length) ||
            (line[name] && line[name].length)
          ) {
            if (!extendedValues[name]) {
              extendedValues[name] = [];
            }
            if (!extendedValues[name].length) {
              for (let s = 0; s < i; s++) {
                extendedValues[name].push(Array(track[s].length).fill(null));
              }
            }
            if (line[name] && line[name].length) {
              extendedValues[name].push(line[name]);
            } else {
              extendedValues[name].push(
                Array(line.line.length || 0).fill(null)
              );
            }
          }
        });
    }
  }
  if (track.length === 0) return;
  const properties = Object.assign(
    getProperties(node),
    getLineStyle(get1(node, "extensions"))
  );
  if (times.length)
    properties.coordTimes = track.length === 1 ? times[0] : times;
  attributeNames.forEach(n => {
    if (extendedValues[n[1]] && extendedValues[n[1]].length) {
      properties[n[1]] =
        track.length === 1 ? extendedValues[n[1]][0] : extendedValues[n[1]];
    }
  });

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
