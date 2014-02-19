var test = require('tape').test,
    assert = require('assert'),
    fs = require('fs'),
    tj = require('../');

if (!process.browser) {
    var xmldom = require('xmldom');
}

test('GPX', function(t) {
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/run.geojson')),
        tj.gpx(toDOM(fs.readFileSync('test/data/run.gpx'))), 'point gpx file');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/osm.geojson')),
        tj.gpx(toDOM(fs.readFileSync('test/data/osm.gpx'))), 'osm gpx file');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/trek.geojson')),
        tj.gpx(toDOM(fs.readFileSync('test/data/trek.gpx'))), 'gpx with route points');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/blue_hills.geojson')),
        tj.gpx(toDOM(fs.readFileSync('test/data/blue_hills.gpx'))), 'gpx with track segments');
    t.end();
});

test('KML', function(t) {
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/point.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/point.kml'))), 'point kml');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/polygon.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/polygon.kml'))), 'polygon kml');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/extended_data.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/extended_data.kml'))), 'extended data kml');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/linestring.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/linestring.kml'))), 'linestring kml');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/style.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/style.kml'))), 'style hash kml');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/inline_style.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/inline_style.kml'))), 'inline style kml');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/multigeometry.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/multigeometry.kml'))), 'multigeometry');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/multigeometry_discrete.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/multigeometry_discrete.kml'))), 'multigeometry_discrete');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/timespan.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/timespan.kml'))), 'timespans');
    t.end();
});

function toDOM(_) {
    if (typeof DOMParser === 'undefined') {
        return (new xmldom.DOMParser()).parseFromString(_.toString());
    } else {
        return (new DOMParser()).parseFromString(_, 'text/xml');
    }
}
