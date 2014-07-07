toGeoJSON = (function() {
    'use strict';

    var removeSpace = (/\s*/g),
        trimSpace = (/^\s*|\s*$/g),
        splitSpace = (/\s+/);
    // generate a short, numeric hash of a string
    function okhash(x) {
        if (!x || !x.length) return 0;
        for (var i = 0, h = 0; i < x.length; i++) {
            h = ((h << 5) - h) + x.charCodeAt(i) | 0;
        } return h;
    }
    // all Y children of X
    function get(x, y) { return x.getElementsByTagName(y); }
    function attr(x, y) { return x.getAttribute(y); }
    // one Y child of X, if any, otherwise null
    function get1(x, y) { var n = get(x, y); return n.length ? n[0] : null; }
    // https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
    function norm(el) { if (el.normalize) { el.normalize(); } return el; }
    // cast array x into numbers
    function numarray(x) {
        for (var j = 0, o = []; j < x.length; j++) o[j] = parseFloat(x[j]);
        return o;
    }
    // get the content of a text node, if any
    function nodeVal(x) {
        if (x) { norm(x); }
        return (x && x.firstChild && x.firstChild.nodeValue) || '';
    }
    // get one coordinate from a coordinate array, if any
    function coord1(v) { return numarray(v.replace(removeSpace, '').split(',')); }
    // get all coordinates from a coordinate array as [[],[]]
    function coord(v) {
        var coords = v.replace(trimSpace, '').split(splitSpace),
            o = [];
        for (var i = 0; i < coords.length; i++) {
            o.push(coord1(coords[i]));
        }
        return o;
    }

    // create a new feature collection parent object
    function fc() {
        return {
            type: 'FeatureCollection',
            features: []
        };
    }
    // create a new folder object
    function fd(node) {
        return {
            name: nodeVal(get1(node, 'name'))
        }
    }

    var serializer;
    if (typeof XMLSerializer !== 'undefined') {
        serializer = new XMLSerializer();
    // only require xmldom in a node environment
    } else if (typeof exports === 'object' && typeof process === 'object' && !process.browser) {
        serializer = new (require('xmldom').XMLSerializer)();
    }
    function xml2str(str) { return serializer.serializeToString(str); }

    var t = {
        kml: function(doc) {

            var // styleindex keeps track of hashed styles in order to match features
                styleIndex = {},
                // atomic geospatial types supported by KML - MultiGeometry is
                // handled separately
                geotypes = ['Polygon', 'LineString', 'Point', 'Track', 'gx:Track'],
                foldersList = get(doc, 'Folder'),
                root,
                styles = get(doc, 'Style'),
                stylesById = {};

            for (var k = 0; k < styles.length; k++) {
                var id = attr(styles[k], 'id');
                stylesById['#' + id] = styles[k];
                styleIndex['#' + id] = okhash(xml2str(styles[k])).toString(16);
            }

            if (foldersList.length > 1) {
                root = {
                    type: 'root',
                    subfolders: parseChildFolders(foldersList).folders
                };
                fillFoldersWithPlacemarks(root);
            } else {
                // all root placemarks in the file
                var placemarks = get(doc, 'Placemark');

                root = fc();
                for (var j = 0; j < placemarks.length; j++) {
                    root.features = root.features.concat(getPlacemark(placemarks[j]));
                }
            }

            
            function parseChildFolders(foldersList) {
                var layersContain = [];
                var layersContainLevel2 = [];
                if (!foldersList.length) return false;
                var folders = {};
                for(var i = 0; i< foldersList.length; i++) {
                    var folder = foldersList[i];
                    if (folder) {
                        var childFolders = parseChildFolders(get(folder, 'Folder')),
                            currentFolder = fd(folder),
                            styleUrl = nodeVal(get1(folder, 'styleUrl')),
                            icon = getListIcon(styleUrl);

                        if (icon) currentFolder.icon = icon;

                        if (childFolders && childFolders.folders) {
                            currentFolder.type = 'folder';
                            currentFolder.subfolders = childFolders.folders;
                            layersContainLevel2 = layersContainLevel2.concat(childFolders.layersContain);
                        } else {
                            currentFolder.type = 'folderNode';
                            currentFolder.node = folder;
                        }
                        folders[attr(folder, 'id')] = currentFolder;
                        layersContain.push(attr(folder, 'id'));
                    }
                }
                layersContainLevel2.forEach(function(id) {
                    if (folders[id]) {
                        delete folders[id];
                    }
                });
                return {
                    folders: folders,
                    layersContain: layersContain.concat(layersContainLevel2)
                };
            }
            function fillFoldersWithPlacemarks(folder) {
                switch(folder.type) {
                    case 'folderNode':
                        var placemarks = get(folder.node, 'Placemark'),
                            features = [];
                        for (var j = 0; j < placemarks.length; j++) {
                            features = features.concat(getPlacemark(placemarks[j]));
                        }
                        folder.geometries = fc();
                        folder.geometries.features = features;
                        delete folder.node;
                        break;
                    default:
                        for (var subfolder in folder.subfolders) {
                            fillFoldersWithPlacemarks(folder.subfolders[subfolder]);
                        }
                        break;
                }
            }
            function kmlColor(v) {
                var color, opacity;
                v = v || "";
                if (v.substr(0, 1) === "#") v = v.substr(1);
                if (v.length === 6 || v.length === 3) color = v;
                if (v.length === 8) {
                    opacity = parseInt(v.substr(0, 2), 16) / 255;
                    color = v.substr(2);
                }
                return [color, isNaN(opacity) ? undefined : opacity];
            }
            function gxCoord(v) { return numarray(v.split(' ')); }
            function gxCoords(root) {
                var elems = get(root, 'coord', 'gx'), coords = [];
                if (elems.length === 0) elems = get(root, 'gx:coord');
                for (var i = 0; i < elems.length; i++) coords.push(gxCoord(nodeVal(elems[i])));
                return coords;
            }
            function getListIcon(styleUrl) {
                if (styleUrl) {
                    var styleNode = stylesById[styleUrl];
                    if (styleNode) {
                        var iconNode = get1(styleNode, 'ItemIcon');
                        if (iconNode) {
                            return nodeVal(get1(iconNode, 'href'));
                        }
                    }
                }
                return null;
            }
            function getIcon(styleUrl) {
                if (styleUrl) {
                    var styleNode = stylesById[styleUrl];
                    if (styleNode) {
                        var iconNode = get1(styleNode, 'Icon');
                        if (iconNode) {
                            return nodeVal(get1(iconNode, 'href'));
                        }
                    }
                }
                return null;
            }
            function getGeometry(root) {
                var geomNode, geomNodes, i, j, k, geoms = [];
                if (get1(root, 'MultiGeometry')) return getGeometry(get1(root, 'MultiGeometry'));
                if (get1(root, 'MultiTrack')) return getGeometry(get1(root, 'MultiTrack'));
                if (get1(root, 'gx:MultiTrack')) return getGeometry(get1(root, 'gx:MultiTrack'));
                for (i = 0; i < geotypes.length; i++) {
                    geomNodes = get(root, geotypes[i]);
                    if (geomNodes) {
                        for (j = 0; j < geomNodes.length; j++) {
                            geomNode = geomNodes[j];
                            if (geotypes[i] == 'Point') {
                                geoms.push({
                                    type: 'Point',
                                    coordinates: coord1(nodeVal(get1(geomNode, 'coordinates')))
                                });
                            } else if (geotypes[i] == 'LineString') {
                                geoms.push({
                                    type: 'LineString',
                                    coordinates: coord(nodeVal(get1(geomNode, 'coordinates')))
                                });
                            } else if (geotypes[i] == 'Polygon') {
                                var rings = get(geomNode, 'LinearRing'),
                                    coords = [];
                                for (k = 0; k < rings.length; k++) {
                                    coords.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
                                }
                                geoms.push({
                                    type: 'Polygon',
                                    coordinates: coords
                                });
                            } else if (geotypes[i] == 'Track' ||
                                geotypes[i] == 'gx:Track') {
                                geoms.push({
                                    type: 'LineString',
                                    coordinates: gxCoords(geomNode)
                                });
                            }
                        }
                    }
                }
                return geoms;
            }
            function getPlacemark(root) {
                var geoms = getGeometry(root), i, properties = {},
                    name = nodeVal(get1(root, 'name')),
                    styleUrl = nodeVal(get1(root, 'styleUrl')),
                    description = nodeVal(get1(root, 'description')),
                    timeSpan = get1(root, 'TimeSpan'),
                    extendedData = get1(root, 'ExtendedData'),
                    lineStyle = get1(root, 'LineStyle'),
                    polyStyle = get1(root, 'PolyStyle'),
                    icon = getIcon(styleUrl);
                
                if (icon) properties.icon = icon;

                if (!geoms.length) return [];
                if (name) properties.name = name;
                if (styleUrl && styleIndex[styleUrl]) {
                    properties.styleUrl = styleUrl;
                    properties.styleHash = styleIndex[styleUrl];
                }
                if (description) properties.description = description;
                if (timeSpan) {
                    var begin = nodeVal(get1(timeSpan, 'begin'));
                    var end = nodeVal(get1(timeSpan, 'end'));
                    properties.timespan = { begin: begin, end: end };
                }
                if (lineStyle) {
                    var linestyles = kmlColor(nodeVal(get1(lineStyle, 'color'))),
                        color = linestyles[0],
                        opacity = linestyles[1],
                        width = parseFloat(nodeVal(get1(lineStyle, 'width')));
                    if (color) properties.stroke = color;
                    if (!isNaN(opacity)) properties['stroke-opacity'] = opacity;
                    if (!isNaN(width)) properties['stroke-width'] = width;
                }
                if (polyStyle) {
                    var polystyles = kmlColor(nodeVal(get1(polyStyle, 'color'))),
                        pcolor = polystyles[0],
                        popacity = polystyles[1],
                        fill = nodeVal(get1(polyStyle, 'fill')),
                        outline = nodeVal(get1(polyStyle, 'outline'));
                    if (pcolor) properties.fill = pcolor;
                    if (!isNaN(popacity)) properties['fill-opacity'] = popacity;
                    if (fill) properties['fill-opacity'] = fill === "1" ? 1 : 0;
                    if (outline) properties['stroke-opacity'] = outline === "1" ? 1 : 0;
                }
                if (extendedData) {
                    var datas = get(extendedData, 'Data'),
                        simpleDatas = get(extendedData, 'SimpleData');

                    for (i = 0; i < datas.length; i++) {
                        properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
                    }
                    for (i = 0; i < simpleDatas.length; i++) {
                        properties[simpleDatas[i].getAttribute('name')] = nodeVal(simpleDatas[i]);
                    }
                }
                return [{
                    type: 'Feature',
                    geometry: (geoms.length === 1) ? geoms[0] : {
                        type: 'GeometryCollection',
                        geometries: geoms
                    },
                    properties: properties
                }];
            }
            return root;
        }
    };
    return t;
})();

if (typeof module !== 'undefined') module.exports = toGeoJSON;
