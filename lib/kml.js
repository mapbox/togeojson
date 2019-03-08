import { nodeVal } from "./shared";

const removeSpace = /\s*/g;
const trimSpace = /^\s*|\s*$/g;
const splitSpace = /\s+/;

// generate a short, numeric hash of a string
function okhash(x) {
  if (!x || !x.length) return 0;
  let h = 0;
  for (let i = 0; i < x.length; i++) {
    h = ((h << 5) - h + x.charCodeAt(i)) | 0;
  }
  return h;
}

// one Y child of X, if any, otherwise null
function get1(x, y) {
  const n = x.getElementsByTagName(y);
  return n.length ? n[0] : null;
}

// get one coordinate from a coordinate array, if any
function coord1(v) {
  return v
    .replace(removeSpace, "")
    .split(",")
    .map(parseFloat);
}

// get all coordinates from a coordinate array as [[],[]]
function coord(v) {
  return v
    .replace(trimSpace, "")
    .split(splitSpace)
    .map(coord1);
}

function xml2str(node) {
  if (node.xml !== undefined) return node.xml;
  if (node.tagName) {
    let output = node.tagName;
    for (let i = 0; i < node.attributes.length; i++) {
      output += node.attributes[i].name + node.attributes[i].value;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      output += xml2str(node.childNodes[i]);
    }
    return output;
  }
  if (node.nodeName === "#text") {
    return (node.nodeValue || node.value || "").trim();
  }
  if (node.nodeName === "#cdata-section") {
    return node.nodeValue;
  }
  return "";
}

const geotypes = ["Polygon", "LineString", "Point", "Track", "gx:Track"];

function kmlColor(v) {
  let color, opacity;
  v = v || "";
  if (v.substr(0, 1) === "#") {
    v = v.substr(1);
  }
  if (v.length === 6 || v.length === 3) {
    color = v;
  }
  if (v.length === 8) {
    opacity = parseInt(v.substr(0, 2), 16) / 255;
    color = "#" + v.substr(6, 2) + v.substr(4, 2) + v.substr(2, 2);
  }
  return [color, isNaN(opacity) ? undefined : opacity];
}

function gxCoords(root) {
  let elems = root.getElementsByTagName("coord");
  const coords = [];
  const times = [];
  if (elems.length === 0) elems = root.getElementsByTagName("gx:coord");
  for (let i = 0; i < elems.length; i++) {
    coords.push(
      nodeVal(elems[i])
        .split(" ")
        .map(parseFloat)
    );
  }
  const timeElems = root.getElementsByTagName("when");
  for (let j = 0; j < timeElems.length; j++) times.push(nodeVal(timeElems[j]));
  return {
    coords: coords,
    times: times
  };
}

function getGeometry(root) {
  let geomNode;
  let geomNodes;
  let i;
  let j;
  let k;
  const geoms = [];
  const coordTimes = [];
  if (get1(root, "MultiGeometry")) {
    return getGeometry(get1(root, "MultiGeometry"));
  }
  if (get1(root, "MultiTrack")) {
    return getGeometry(get1(root, "MultiTrack"));
  }
  if (get1(root, "gx:MultiTrack")) {
    return getGeometry(get1(root, "gx:MultiTrack"));
  }
  for (i = 0; i < geotypes.length; i++) {
    geomNodes = root.getElementsByTagName(geotypes[i]);
    if (geomNodes) {
      for (j = 0; j < geomNodes.length; j++) {
        geomNode = geomNodes[j];
        if (geotypes[i] === "Point") {
          geoms.push({
            type: "Point",
            coordinates: coord1(nodeVal(get1(geomNode, "coordinates")))
          });
        } else if (geotypes[i] === "LineString") {
          geoms.push({
            type: "LineString",
            coordinates: coord(nodeVal(get1(geomNode, "coordinates")))
          });
        } else if (geotypes[i] === "Polygon") {
          const rings = geomNode.getElementsByTagName("LinearRing"),
            coords = [];
          for (k = 0; k < rings.length; k++) {
            coords.push(coord(nodeVal(get1(rings[k], "coordinates"))));
          }
          geoms.push({
            type: "Polygon",
            coordinates: coords
          });
        } else if (geotypes[i] === "Track" || geotypes[i] === "gx:Track") {
          const track = gxCoords(geomNode);
          geoms.push({
            type: "LineString",
            coordinates: track.coords
          });
          if (track.times.length) coordTimes.push(track.times);
        }
      }
    }
  }
  return {
    geoms: geoms,
    coordTimes: coordTimes
  };
}

function getPlacemark(root, styleIndex, styleMapIndex, styleByHash) {
  const geomsAndTimes = getGeometry(root);
  let i;
  const properties = {};
  const name = nodeVal(get1(root, "name"));
  const address = nodeVal(get1(root, "address"));
  let styleUrl = nodeVal(get1(root, "styleUrl"));
  const description = nodeVal(get1(root, "description"));
  const timeSpan = get1(root, "TimeSpan");
  const timeStamp = get1(root, "TimeStamp");
  const extendedData = get1(root, "ExtendedData");
  let lineStyle = get1(root, "LineStyle");
  let polyStyle = get1(root, "PolyStyle");
  const visibility = get1(root, "visibility");

  if (!geomsAndTimes.geoms.length) return;
  if (name) properties.name = name;
  if (address) properties.address = address;
  if (styleUrl) {
    if (styleUrl[0] !== "#") {
      styleUrl = "#" + styleUrl;
    }

    properties.styleUrl = styleUrl;
    if (styleIndex[styleUrl]) {
      properties.styleHash = styleIndex[styleUrl];
    }
    if (styleMapIndex[styleUrl]) {
      properties.styleMapHash = styleMapIndex[styleUrl];
      properties.styleHash = styleIndex[styleMapIndex[styleUrl].normal];
    }
    // Try to populate the lineStyle or polyStyle since we got the style hash
    const style = styleByHash[properties.styleHash];
    if (style) {
      if (!lineStyle) lineStyle = get1(style, "LineStyle");
      if (!polyStyle) polyStyle = get1(style, "PolyStyle");
      const iconStyle = get1(style, "IconStyle");
      if (iconStyle) {
        const icon = get1(iconStyle, "Icon");
        if (icon) {
          const href = nodeVal(get1(icon, "href"));
          if (href) properties.icon = href;
        }
      }
    }
  }
  if (description) properties.description = description;
  if (timeSpan) {
    const begin = nodeVal(get1(timeSpan, "begin"));
    const end = nodeVal(get1(timeSpan, "end"));
    properties.timespan = { begin: begin, end: end };
  }
  if (timeStamp) {
    properties.timestamp = nodeVal(get1(timeStamp, "when"));
  }
  if (lineStyle) {
    const linestyles = kmlColor(nodeVal(get1(lineStyle, "color"))),
      color = linestyles[0],
      opacity = linestyles[1],
      width = parseFloat(nodeVal(get1(lineStyle, "width")));
    if (color) properties.stroke = color;
    if (!isNaN(opacity)) properties["stroke-opacity"] = opacity;
    if (!isNaN(width)) properties["stroke-width"] = width;
  }
  if (polyStyle) {
    const polystyles = kmlColor(nodeVal(get1(polyStyle, "color")));
    const pcolor = polystyles[0];
    const popacity = polystyles[1];
    const fill = nodeVal(get1(polyStyle, "fill"));
    const outline = nodeVal(get1(polyStyle, "outline"));
    if (pcolor) properties.fill = pcolor;
    if (!isNaN(popacity)) properties["fill-opacity"] = popacity;
    if (fill)
      properties["fill-opacity"] =
        fill === "1" ? properties["fill-opacity"] || 1 : 0;
    if (outline)
      properties["stroke-opacity"] =
        outline === "1" ? properties["stroke-opacity"] || 1 : 0;
  }
  if (extendedData) {
    const datas = extendedData.getElementsByTagName("Data"),
      simpleDatas = extendedData.getElementsByTagName("SimpleData");

    for (i = 0; i < datas.length; i++) {
      properties[datas[i].getAttribute("name")] = nodeVal(
        get1(datas[i], "value")
      );
    }
    for (i = 0; i < simpleDatas.length; i++) {
      properties[simpleDatas[i].getAttribute("name")] = nodeVal(simpleDatas[i]);
    }
  }
  if (visibility) {
    properties.visibility = nodeVal(visibility);
  }
  if (geomsAndTimes.coordTimes.length) {
    properties.coordTimes =
      geomsAndTimes.coordTimes.length === 1
        ? geomsAndTimes.coordTimes[0]
        : geomsAndTimes.coordTimes;
  }
  const feature = {
    type: "Feature",
    geometry:
      geomsAndTimes.geoms.length === 1
        ? geomsAndTimes.geoms[0]
        : {
            type: "GeometryCollection",
            geometries: geomsAndTimes.geoms
          },
    properties: properties
  };
  if (root.getAttribute("id")) feature.id = root.getAttribute("id");
  return feature;
}

export function* kmlGen(doc) {
  // styleindex keeps track of hashed styles in order to match feature
  const styleIndex = {};
  const styleByHash = {};
  // stylemapindex keeps track of style maps to expose in properties
  const styleMapIndex = {};
  // atomic geospatial types supported by KML - MultiGeometry is
  // handled separately
  // all root placemarks in the file
  const placemarks = doc.getElementsByTagName("Placemark");
  const styles = doc.getElementsByTagName("Style");
  const styleMaps = doc.getElementsByTagName("StyleMap");

  for (let k = 0; k < styles.length; k++) {
    const hash = okhash(xml2str(styles[k])).toString(16);
    styleIndex["#" + styles[k].getAttribute("id")] = hash;
    styleByHash[hash] = styles[k];
  }
  for (let l = 0; l < styleMaps.length; l++) {
    styleIndex["#" + styleMaps[l].getAttribute("id")] = okhash(
      xml2str(styleMaps[l])
    ).toString(16);
    const pairs = styleMaps[l].getElementsByTagName("Pair");
    const pairsMap = {};
    for (let m = 0; m < pairs.length; m++) {
      pairsMap[nodeVal(get1(pairs[m], "key"))] = nodeVal(
        get1(pairs[m], "styleUrl")
      );
    }
    styleMapIndex["#" + styleMaps[l].getAttribute("id")] = pairsMap;
  }
  for (let j = 0; j < placemarks.length; j++) {
    const feature = getPlacemark(
      placemarks[j],
      styleIndex,
      styleMapIndex,
      styleByHash
    );
    if (feature) yield feature;
  }
}

export function kml(doc) {
  return {
    type: "FeatureCollection",
    features: Array.from(kmlGen(doc))
  };
}
