var tj = toGeoJSON;

function file(url, cb) {
    var w = new window.XMLHttpRequest();
    w.onload = function() {
        cb(this.responseText);
    };
    w.open('GET', url, true);
    w.send();
}

function filexml(url, cb) {
    file(url, function(r) {
        cb((new DOMParser()).parseFromString(r, 'text/xml'));
    });
}

function filejson(url, cb) {
    file(url, function(r) {
        cb(JSON.parse(r));
    });
}

function against(name) {
    return function(done) {
        filexml('data/' + name + '.kml', function(kml) {
            filejson('data/' + name + '.geojson', function(json) {
                expect(tj.kml(kml)).to.eql(json);
                done();
            });
        });
    };
}

describe('KML to GeoJSON conversion', function() {
    describe('basic features', function() {
        it('can parse a point kml file', against('point'));
        it('can parse a polygon kml file', against('polygon'));
        it('can parse a extended data kml file', against('extended_data'));
        it('can parse a linestring kml file', against('linestring'));
    });
    describe('styles', function() {
        it('derive style hashes', against('style'));
    });
    describe('multitrack', function() {
        it('supports multitracks', against('multitrack'));
    });
    describe('multigeometry', function() {
        it('can parse a multigeometry kml file with the same type', against('multigeometry'));
        it('can parse a multigeometry kml file with different types', against('multigeometry_discrete'));
    });
    describe('simpledata', function() {
        it('parses simpledata', against('simpledata'));
    });
});
