toGeoJSON = {
    kml: function(doc) {
        var gj = { type: 'FeatureCollection', features: [] },
            geotypes = ["MultiGeometry", "Polygon", "LineString", "Point"],
            removeSpace = (/\s*/g);

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

        function getplacemark(root) {
            var geometry, coords;
            for (var i = 0; i < geotypes.length; i++) {
                geometry = get1(root, geotypes[i]);
                if (geometry) {
                    var coordinates = get1(geometry, 'coordinates');
                    coords = numberarray(nodeVal(coordinates)
                        .replace(removeSpace, '').split(','));
                    break;
                }
            }
            var name = nodeVal(get1(root, 'name'));
            var description = nodeVal(get1(root, 'description'));
            return {
                geometry: {
                    type: 'Point',
                    coordinates: coords
                },
                properties: {
                    name: name,
                    description: description
                }
            };
        }

        var placemarks = get(doc, 'Placemark');

        for (var i = 0; i < placemarks.length; i++) {
            gj.features.push(getplacemark(placemarks[i]));
        }

        return gj;
    }
};
