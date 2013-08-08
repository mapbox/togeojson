function againstGPX(name) {
    return function(done) {
        filejson('data/' + name + '.geojson', function(json) {
            filexml('data/' + name + '.gpx', function(gpx) {
                expect(tj.gpx(gpx)).to.eql(json);
                done();
            });
        });
    };
}

describe('GPX to GeoJSON conversion', function() {
    it('can parse a point gpx file', againstGPX('run'));
    it('can parse a osm gpx file', againstGPX('osm'));
    it('can parse a gpx file with route points', againstGPX('trek'));
});
