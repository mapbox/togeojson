var tj = require('../'),
    fs = require('fs'),
    assert = require('assert'),
    jsdom = require('jsdom').jsdom;

describe('KML to GeoJSON conversion', function() {
    it('can parse a point kml file', function() {
        assert.deepEqual(tj.kml(
            jsdom(fs.readFileSync('./test/data/point.kml', 'utf8'))),
            JSON.parse(fs.readFileSync('./test/data/point.geojson', 'utf8')));
    });
    it('can parse a polygon kml file', function() {
        assert.deepEqual(tj.kml(
            jsdom(fs.readFileSync('./test/data/polygon.kml', 'utf8'))),
            JSON.parse(fs.readFileSync('./test/data/polygon.geojson', 'utf8')));
    });
    it('can parse a extended data kml file', function() {
        assert.deepEqual(tj.kml(
            jsdom(fs.readFileSync('./test/data/extended_data.kml', 'utf8'))),
            JSON.parse(fs.readFileSync('./test/data/extended_data.geojson', 'utf8')));
    });
    it('can parse a linestring kml file', function() {
        assert.deepEqual(tj.kml(
            jsdom(fs.readFileSync('./test/data/linestring.kml', 'utf8'))),
            JSON.parse(fs.readFileSync('./test/data/linestring.geojson', 'utf8')));
    });
});
