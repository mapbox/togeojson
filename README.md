# Convert KML and GPX to GeoJSON.

[![CircleCI](https://circleci.com/gh/tmcw/togeojson/tree/master.svg?style=svg)](https://circleci.com/gh/tmcw/togeojson/tree/master)

:sparkles: _This is a maintained and modernized fork of the toGeoJSON project, which I (Tom) wrote while at Mapbox,
and am now maintaining on a personal basis because the Mapbox-owned project is abandoned._

This converts [KML](https://developers.google.com/kml/documentation/) & [GPX](http://www.topografix.com/gpx.asp)
to [GeoJSON](http://www.geojson.org/), in a browser or with [Node.js](http://nodejs.org/).

* [x] Dependency-free
* [x] Tiny
* [x] Tested
* [x] Node.js + Browsers

## API

### `toGeoJSON.kml(doc)`

Convert a KML document to GeoJSON. The first argument, `doc`, must be a KML
document as an XML DOM - not as a string. You can get this using jQuery's default
`.ajax` function or using a bare XMLHttpRequest with the `.response` property
holding an XML DOM.

The output is a JavaScript object of GeoJSON data. You can convert it to a string
with [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
or use it directly in libraries.

### `toGeoJSON.kmlGen(doc)`

Convert KML to GeoJSON incrementally, returning a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
that yields output feature by feature.

### `toGeoJSON.gpx(doc)`

Convert a GPX document to GeoJSON. The first argument, `doc`, must be a GPX
document as an XML DOM - not as a string. You can get this using jQuery's default
`.ajax` function or using a bare XMLHttpRequest with the `.response` property
holding an XML DOM.

The output is a JavaScript object of GeoJSON data, same as `.kml` outputs.

### `toGeoJSON.gpxGen(doc)`

Convert GPX to GeoJSON incrementally, returning a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
that yields output feature by feature.

## CLI

Install it into your path with `npm install -g @tmcw/togeojson`.

```
~> togeojson file.kml > file.geojson
```

## Node.js

Install it into your project with `npm install --save @tmcw/togeojson`.

```javascript
// using togeojson in nodejs

const tj = require('@tmcw/togeojson');
const fs = require('fs');
// node doesn't have xml parsing or a dom. use xmldom
const DOMParser = require('xmldom').DOMParser;

const kml = new DOMParser().parseFromString(fs.readFileSync('foo.kml', 'utf8'));

const converted = tj.kml(kml);

const convertedWithStyles = tj.kml(kml, { styles: true });
```

## Browser

```html
<script type=module>
import {kml} from "https://unpkg.com/@tmcw/togeojson?module";

fetch('test/data/linestring.kml').then(function(response) {
  return response.xml();
}).then(function(xml) {
  console.log(kml(xml));
});
</script>
```

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

### Should toGeoJSON support feature X from KML?

This module should support converting all KML and GPX features that have commonplace
equivalents in GeoJSON.

KML is a very complex format with many features. Some of these features, like NetworkLinks,
folders, and GroundOverlays, don't have a GeoJSON equivalent. In these cases,
toGeoJSON doesn't convert the features. It also doesn't crash on these constructs:
toGeoJSON should be able to run on all valid KML and GPX files without crashing:
but for some files it may have no output.

We encourage other libraries to look into supporting these features, but
support for them is out of scope for toGeoJSON.

## Protips:

Have a string of XML and need an XML DOM?

```js
var dom = (new DOMParser()).parseFromString(xmlStr, 'text/xml');
```
