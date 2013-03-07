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
    describe('styles', function() {
        it('derive style hashes', function() {
            assert.deepEqual(tj.kml(
                jsdom(fs.readFileSync('./test/data/style.kml', 'utf8')), { styles: true }),
                JSON.parse(fs.readFileSync('./test/data/style.geojson', 'utf8')));
        });
        it('not derive style hashes', function() {
            assert.deepEqual(tj.kml(
                jsdom(fs.readFileSync('./test/data/style.kml', 'utf8'))),
                JSON.parse(fs.readFileSync('./test/data/style_no.geojson', 'utf8')));
        });
    });
    describe('multigeometry', function() {
        it('can parse a multigeometry kml file with the same type', function() {
            assert.deepEqual(tj.kml(
                jsdom(fs.readFileSync('./test/data/multigeometry.kml', 'utf8'))),
                JSON.parse(fs.readFileSync('./test/data/multigeometry.geojson', 'utf8')));
        });
        it('can parse a multigeometry kml file with different types', function() {
            assert.deepEqual(tj.kml(
                jsdom(fs.readFileSync('./test/data/multigeometry_discrete.kml', 'utf8'))),
                JSON.parse(fs.readFileSync('./test/data/multigeometry_discrete.geojson', 'utf8')));
        });
    });
    describe('simpledata', function() {
        it('parses simpledata', function() {
            assert.deepEqual(tj.kml(
                jsdom(fs.readFileSync('./test/data/simpledata.kml', 'utf8'))),
                JSON.parse(fs.readFileSync('./test/data/simpledata.geojson', 'utf8')));
        });
    });
});
