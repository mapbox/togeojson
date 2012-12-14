toGeoJSON = {
    kml: function(doc) {
        var gj = { type: 'FeatureCollection', features: [] },
            geotypes = ["MultiGeometry", "Polygon", "LineString", "Point"],
            removeSpace = (/\s*/g),
            trimSpace = (/^\s*|\s*$/g),
            splitSpace = (/\s+/);

        function get(x, y) { return x.getElementsByTagNameNS('*', y); }

        function get1(x, y) {
            var n = get(x, y);
            return n.length ? n[0] : null;
        }

        function numberarray(x) {
            for (var j = 0, o = []; j < x.length; j++) o[j] = parseFloat(x[j]);
            return o;
        }

        function nodeVal(x) { return x && x.firstChild.nodeValue; }

        function coord1(v) {
            return numberarray(v.replace(removeSpace, '').split(','));
        }

        function coord(v) {
            var coords = v.replace(trimSpace, '').split(splitSpace), o = [];
            for (var i = 0; i < coords.length; i++) o.push(coord1(coords[i]));
            return o;
        }

        function getplacemark(root) {
            var geometry, coordinates, i;
            for (i = 0; i < geotypes.length; i++) {
                geometry = get1(root, geotypes[i]);
                if (geometry) {
                    if (geotypes[i] == 'Point') {
                        coordinates = coord1(nodeVal(get1(geometry, 'coordinates')));
                    }
                    if (geotypes[i] == 'LineString') {
                        coordinates = coord(nodeVal(get1(geometry, 'coordinates')));
                    }
                    break;
                }
            }

            var properties = {
                name: nodeVal(get1(root, 'name')),
                description: nodeVal(get1(root, 'description'))
            };

            var extendedData = get1(root, 'ExtendedData');

            if (extendedData) {
                var datas = get(extendedData, 'Data');
                for (i = 0; i < datas.length; i++) {
                    properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
                }
            }

            return {
                geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                properties: properties
            };
        }

        var placemarks = get(doc, 'Placemark');

        for (var j = 0; j < placemarks.length; j++) {
            gj.features.push(getplacemark(placemarks[j]));
        }

        return gj;
    }
};
