toGeoJSON = {
    kml: function(doc) {
        var gj = { type: 'FeatureCollection', features: [] },
            geotypes = ['Polygon', 'LineString', 'Point'],
            multigeotypes = { Polygon: 'MultiPolygon', LineString: 'MultiLineString', Point: 'MultiPoint' },
            removeSpace = (/\s*/g),
            trimSpace = (/^\s*|\s*$/g), splitSpace = (/\s+/),
            placemarks = get(doc, 'Placemark');

        for (var j = 0; j < placemarks.length; j++) {
            gj.features = gj.features.concat(getPlacemark(placemarks[j]));
        }

        function get(x, y) { return x.getElementsByTagName(y); }
        function get1(x, y) { var n = get(x, y); return n.length ? n[0] : null; }
        function numarray(x) {
            for (var j = 0, o = []; j < x.length; j++) o[j] = parseFloat(x[j]);
            return o;
        }
        function nodeVal(x) { return x && x.firstChild.nodeValue; }
        function coord1(v) { return numarray(v.replace(removeSpace, '').split(',')); }
        function coord(v) {
            var coords = v.replace(trimSpace, '').split(splitSpace), o = [];
            for (var i = 0; i < coords.length; i++) o.push(coord1(coords[i]));
            return o;
        }
        function coalesce(geoms) {
            if (geoms.length === 1) return geoms[0];
            for (var i = 0, t = null, coords = []; i < geoms.length; i++) {
                if (t && t !== geoms[i].type) return false; // more than 1 type
                coords.push(geoms[i].coordinates);
                t = geoms[i].type;
            }
            return { type: multigeotypes[t], coordinates: coords };
        }
        function getGeometry(root) {
            var geomNode, geomNodes, i, j, k, geoms = [];
            if (get1(root, 'MultiGeometry')) return getGeometry(get1(root, 'MultiGeometry'));
            for (i = 0; i < geotypes.length; i++) {
                if (geomNodes = get(root, geotypes[i])) {
                    for (j = 0; j < geomNodes.length; j++) {
                        geomNode = geomNodes[j];
                        if (geotypes[i] == 'Point') {
                            geoms.push({ type: 'Point',
                                coordinates: coord1(nodeVal(get1(geomNode, 'coordinates')))
                            });
                        } else if (geotypes[i] == 'LineString') {
                            geoms.push({ type: 'LineString',
                                coordinates: coord(nodeVal(get1(geomNode, 'coordinates')))
                            });
                        } else if (geotypes[i] == 'Polygon') {
                            var rings = get(geomNode, 'LinearRing'), coords = [];
                            for (k = 0; k < rings.length; k++) {
                                coords.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
                            }
                            geoms.push({ type: 'Polygon', coordinates: coords });
                        }
                    }
                }
            }
            return geoms;
        }
        function getPlacemark(root) {
            var geometry = getGeometry(root), i, properties = {},
                name = nodeVal(get1(root, 'name')),
                description = nodeVal(get1(root, 'description')),
                extendedData = get1(root, 'ExtendedData');
            if (!geometry) return false;
            if (name) properties.name = name;
            if (description) properties.description = description;
            if (extendedData) {
                var datas = get(extendedData, 'Data');
                for (i = 0; i < datas.length; i++) {
                    properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
                }
            }
            if (coalesce(geometry)) return [{ type: 'Feature', geometry: coalesce(geometry), properties: properties }];
            else {
                var features = [];
                for (i = 0; i < geometry.length; i++) {
                    features.push({ type: 'Feature', geometry: geometry[i], properties: properties });
                }
                return features;
            }
        }
        return gj;
    }
};

if (typeof module !== 'undefined') module.exports = toGeoJSON;
