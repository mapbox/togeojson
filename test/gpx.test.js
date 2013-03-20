var tj = require('../'),
    fs = require('fs'),
    assert = require('assert'),
    jsdom = require('jsdom').jsdom;

describe('GPX to GeoJSON conversion', function() {
    it('can parse a point gpx file', function() {
        assert.deepEqual(tj.gpx(
            jsdom(fs.readFileSync('./test/data/run.gpx', 'utf8'))),
            JSON.parse(fs.readFileSync('./test/data/run.geojson', 'utf8')));
    });
    it('can parse a osm gpx file', function() {
        assert.deepEqual(tj.gpx(
            jsdom(fs.readFileSync('./test/data/osm.gpx', 'utf8'))),
            JSON.parse(fs.readFileSync('./test/data/osm.geojson', 'utf8')));
    });
    it('can parse a gpx file with elevation', function() {
        assert.deepEqual(tj.gpx(
            jsdom(fs.readFileSync('./test/data/blue_hills.gpx', 'utf8'))),
            JSON.parse(fs.readFileSync('./test/data/blue_hills.geojson', 'utf8')));
    });
});
