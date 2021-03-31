import { nodeVal, get1 } from "./shared";

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

// get one coordinate from a coordinate array, if any
function coord1(v) {
  return v.replace(removeSpace, "").split(",").map(parseFloat);
}

// get all coordinates from a coordinate array as [[],[]]
function coord(v) {
  return v.replace(trimSpace, "").split(splitSpace).map(coord1);
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

function kmlColor(properties, elem, prefix) {
  let v = nodeVal(get1(elem, "color")) || "";
  const colorProp =
    prefix == "stroke" || prefix === "fill" ? prefix : prefix + "-color";
  if (v.substr(0, 1) === "#") {
    v = v.substr(1);
  }
  if (v.length === 6 || v.length === 3) {
    properties[colorProp] = v;
  } else if (v.length === 8) {
    properties[prefix + "-opacity"] = parseInt(v.substr(0, 2), 16) / 255;
    properties[colorProp] =
      "#" + v.substr(6, 2) + v.substr(4, 2) + v.substr(2, 2);
  }
}

function numericProperty(properties, elem, source, target) {
  const val = parseFloat(nodeVal(get1(elem, source)));
  if (!isNaN(val)) properties[target] = val;
}

function gxCoords(root) {
  let elems = root.getElementsByTagName("coord");
  const coords = [];
  const times = [];
  if (elems.length === 0) elems = root.getElementsByTagName("gx:coord");
  for (let i = 0; i < elems.length; i++) {
    coords.push(nodeVal(elems[i]).split(" ").map(parseFloat));
  }
  const timeElems = root.getElementsByTagName("when");
  for (let j = 0; j < timeElems.length; j++) times.push(nodeVal(timeElems[j]));
  return {
    coords: coords,
    times: times,
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
            coordinates: coord1(nodeVal(get1(geomNode, "coordinates"))),
          });
        } else if (geotypes[i] === "LineString") {
          geoms.push({
            type: "LineString",
            coordinates: coord(nodeVal(get1(geomNode, "coordinates"))),
          });
        } else if (geotypes[i] === "Polygon") {
          const rings = geomNode.getElementsByTagName("LinearRing"),
            coords = [];
          for (k = 0; k < rings.length; k++) {
            coords.push(coord(nodeVal(get1(rings[k], "coordinates"))));
          }
          geoms.push({
            type: "Polygon",
            coordinates: coords,
          });
        } else if (geotypes[i] === "Track" || geotypes[i] === "gx:Track") {
          const track = gxCoords(geomNode);
          geoms.push({
            type: "LineString",
            coordinates: track.coords,
          });
          if (track.times.length) coordTimes.push(track.times);
        }
      }
    }
  }
  return {
    geoms: geoms,
    coordTimes: coordTimes,
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
  let iconStyle = get1(root, "IconStyle");
  let labelStyle = get1(root, "LabelStyle");
  let lineStyle = get1(root, "LineStyle");
  let polyStyle = get1(root, "PolyStyle");
  const visibility = get1(root, "visibility");

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
      if (!iconStyle) iconStyle = get1(style, "IconStyle");
      if (!labelStyle) labelStyle = get1(style, "LabelStyle");
      if (!lineStyle) lineStyle = get1(style, "LineStyle");
      if (!polyStyle) polyStyle = get1(style, "PolyStyle");
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
  if (iconStyle) {
    kmlColor(properties, iconStyle, "icon");
    numericProperty(properties, iconStyle, "scale", "icon-scale");
    numericProperty(properties, iconStyle, "heading", "icon-heading");

    const hotspot = get1(iconStyle, "hotSpot");
    if (hotspot) {
      const left = parseFloat(hotspot.getAttribute("x"));
      const top = parseFloat(hotspot.getAttribute("y"));
      if (!isNaN(left) && !isNaN(top)) properties["icon-offset"] = [left, top];
    }
    const icon = get1(iconStyle, "Icon");
    if (icon) {
      const href = nodeVal(get1(icon, "href"));
      if (href) properties.icon = href;
    }
  }
  if (labelStyle) {
    kmlColor(properties, labelStyle, "label");
    numericProperty(properties, labelStyle, "scale", "label-scale");
  }
  if (lineStyle) {
    kmlColor(properties, lineStyle, "stroke");
    numericProperty(properties, lineStyle, "width", "stroke-width");
  }
  if (polyStyle) {
    kmlColor(properties, polyStyle, "fill");
    const fill = nodeVal(get1(polyStyle, "fill"));
    const outline = nodeVal(get1(polyStyle, "outline"));
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
    properties.coordinateProperties = {
      times: geomsAndTimes.coordTimes.length === 1
        ? geomsAndTimes.coordTimes[0]
        : geomsAndTimes.coordTimes
    };
  }
  const feature = {
    type: "Feature",
    geometry:
      geomsAndTimes.geoms.length === 0
        ? null
        : geomsAndTimes.geoms.length === 1
        ? geomsAndTimes.geoms[0]
        : {
            type: "GeometryCollection",
            geometries: geomsAndTimes.geoms,
          },
    properties: properties,
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
    features: Array.from(kmlGen(doc)),
  };
}
