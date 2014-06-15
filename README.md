[![Build status](https://img.shields.io/travis/mapbox/togeojson.svg "Build status")](http://travis-ci.org/mapbox/togeojson)
[![Coverage status](https://img.shields.io/coveralls/mapbox/togeojson.svg "Coverage status")](https://coveralls.io/r/mapbox/togeojson)
[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

# Convert KML and GPX to GeoJSON.

This converts [KML](https://developers.google.com/kml/documentation/) & [GPX](http://www.topografix.com/gpx.asp)
to [GeoJSON](http://www.geojson.org/), in a browser or with [Node.js](http://nodejs.org/).

* [x] Dependency-free
* [x] Tiny
* [x] Tested
* [x] Node.js + Browsers

Want to use this with [Leaflet](http://leafletjs.com/)? Try [leaflet-omnivore](https://github.com/mapbox/leaflet-omnivore)!

## API

### `toGeoJSON.kml(doc)`

Convert a KML document to GeoJSON. The first argument, `doc`, must be a KML
document as an XML DOM - not as a string. You can get this using jQuery's default
`.ajax` function or using a bare XMLHttpRequest with the `.response` property
holding an XML DOM.

The output is a JavaScript object of GeoJSON data. You can convert it to a string
with [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
or use it directly in libraries like [mapbox.js](http://www.mapbox.com/mapbox.js/).

### `toGeoJSON.gpx(doc)`

Convert a GPX document to GeoJSON. The first argument, `doc`, must be a GPX
document as an XML DOM - not as a string. You can get this using jQuery's default
`.ajax` function or using a bare XMLHttpRequest with the `.response` property
holding an XML DOM.

The output is a JavaScript object of GeoJSON data, same as `.kml` outputs.

## CLI

Install it into your path with `npm install -g togeojson`.

```
~> togeojson file.kml > file.geojson
```

## Node.js

Install it into your project with `npm install --save togeojson`.

```javascript
// using togeojson in nodejs

var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

var kml = new DOMParser().parseFromString(fs.readFileSync('foo.kml', 'utf8'));

var converted = tj.kml(kml);

var convertedWithStyles = tj.kml(kml, { styles: true });
```

## Browser

Download it into your project like

    wget https://raw.github.com/tmcw/togeojson/gh-pages/togeojson.js

```html
<script src='jquery.js'></script>
<script src='togeojson.js'></script>
<script>
$.ajax('test/data/linestring.kml').done(function(xml) {
    console.log(toGeoJSON.kml(xml));
});
</script>
```

toGeoJSON doesn't include AJAX - you can use [jQuery](http://jquery.com/) for
just AJAX.

### KML Feature Support

* [x] Point
* [x] Polygon
* [x] LineString
* [x] name & description
* [x] ExtendedData
* [x] SimpleData
* [x] MultiGeometry -> GeometryCollection
* [x] Styles with hashing
* [x] Tracks & MultiTracks with `gx:coords`, including altitude
* [x] [TimeSpan](https://developers.google.com/kml/documentation/kmlreference#timespan)
* [x] [TimeStamp](https://developers.google.com/kml/documentation/kmlreference#timestamp)
* [ ] NetworkLinks
* [ ] GroundOverlays

### GPX Feature Support

* [x] Line Paths
* [x] Line styles
* [ ] Properties
  * [x] 'name', 'cmt', 'desc', 'link', 'time', 'keywords', 'sym', 'type' tags
  * [ ] 'author', 'copyright' tags

## FAQ

### What is hashing?

KML's style system isn't semantic: a typical document made through official tools
(read Google) has hundreds of identical styles. So, togeojson does its best to
make this into something usable, by taking a quick hash of each style and exposing
`styleUrl` and `styleHash` to users. This lets you work backwards from the awful
representation and build your own styles or derive data based on the classes
chosen.

Implied here is that this does not try to represent all data contained in KML
styles.

### Why doesn't toGeoJSON support NetworkLinks?

The NetworkLink KML construct allows KML files to refer to other online
or local KML files for their content. It's often used to let people pass around
files but keep the actual content on servers.

In order to support NetworkLinks, toGeoJSON would need to be asynchronous
and perform network requests. These changes would make it more complex and less
reliable in order to hit a limited usecase - we'd rather keep it simple
and not require users to think about network connectivity and bandwith
in order to convert files.

NetworkLink support could be implemented in a separate library as a pre-processing
step if desired.

## Protips:

Have a string of XML and need an XML DOM?

```js
var dom = (new DOMParser()).parseFromString(xmlStr, 'text/xml');
```
