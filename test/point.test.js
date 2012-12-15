var tj = require('../'),
    fs = require('fs'),
    assert = require('assert'),
    jsdom = require('jsdom').jsdom;

describe('Point KML', function() {
    it('can parse a point kml file', function() {
        var kml = jsdom(fs.readFileSync('./test/data/point.kml', 'utf8'));
        var converted = tj.kml(kml);
        assert.deepEqual(converted, {
          "type": "FeatureCollection",
          "features": [
            {
              "geometry": {
                "type": "Point",
                "coordinates": [-122.0822035425683, 37.42228990140251, 0]
              },
              "properties": {
                "name": "Simple placemark",
                "description": "Attached to the ground. Intelligently places itself \n       at the height of the underlying terrain."
              }
            }
          ]
        });
    });
});
