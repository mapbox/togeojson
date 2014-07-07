var test = require('tape').test,
    assert = require('assert'),
    fs = require('fs'),
    tj = require('../');

if (!process.browser) {
    var xmldom = require('xmldom');
}

test('KML', function(t) {
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/gxtrack.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/gxtrack.kml'))), 'gx:track');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/gxmultitrack.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/gxmultitrack.kml'))), 'gx:multitrack');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/noname.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/noname.kml'))), 'no name');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/nogeomplacemark.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/nogeomplacemark.kml'))), 'simpledata');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/simpledata.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/simpledata.kml'))), 'simpledata');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/literal_color.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/literal_color.kml'))), '{3,6} color form');
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
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/subfolders.json')),
        tj.kml(toDOM(fs.readFileSync('test/data/subfolders.kml'))), 'subfolders');
    t.equal(
        JSON.stringify(JSON.parse(fs.readFileSync('test/data/selfclosing.geojson'))),
        JSON.stringify(tj.kml(toDOM(fs.readFileSync('test/data/selfclosing.kml')))), 'self-closing coord bug');
    t.deepEqual(
        JSON.parse(fs.readFileSync('test/data/styles-with-subfolders.geojson')),
        tj.kml(toDOM(fs.readFileSync('test/data/styles-with-subfolders.kml'))), 'styles-with-subfolders');
    t.end();
});

function toDOM(_) {
    if (typeof DOMParser === 'undefined') {
        return (new xmldom.DOMParser()).parseFromString(_.toString());
    } else {
        return (new DOMParser()).parseFromString(_, 'text/xml');
    }
}
