# Convert KML, GPX, and TCX to GeoJSON.

_togeojson development is supported by 🌎 [placemark.io](https://placemark.io/)_

This converts [KML](https://developers.google.com/kml/documentation/), [TCX](https://en.wikipedia.org/wiki/Training_Center_XML), & [GPX](http://www.topografix.com/gpx.asp)
to [GeoJSON](http://www.geojson.org/), in a browser or with [Node.js](http://nodejs.org/).

- [x] Dependency-free
- [x] Tiny
- [x] Tested
- [x] Node.js + Browsers

_This is a JavaScript library that lets projects convert KML and GPX to GeoJSON. If you're
looking for a command line too, use [@tmcw/togeojson-cli](https://github.com/tmcw/togeojson-cli). If you
want to convert one KML or GPX file, use [my online tool](https://observablehq.com/@tmcw/convert-kml-to-geojson).
If you want to convert another format, consider [GDAL](https://www.gdal.org/)._

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

The output is a JavaScript object of GeoJSON data, same as `.kml` outputs, with the
addition of a `_gpxType` property on each `LineString` feature that indicates whether
the feature was encoded as a route (`rte`) or track (`trk`) in the GPX document.

### `toGeoJSON.gpxGen(doc)`

Convert GPX to GeoJSON incrementally, returning a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
that yields output feature by feature.

### `toGeoJSON.tcx(doc)`

Convert a TCX document to GeoJSON. The first argument, `doc`, must be a TCX
document as an XML DOM - not as a string.

### `toGeoJSON.tcxGen(doc)`

Convert a TCX document to GeoJSON incrementally, returning a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
that yields output feature by feature. The first argument, `doc`, must be a TCX
document as an XML DOM - not as a string.

## Property conversions

In addition to converting KML’s `<ExtendedData>` verbatim, @tmcw/togeojson
also encodes parts of KML, GPX, and TCX files that otherwise would be lost.

**KML**

- Style properties: `fill-color`, `fill-opacity`, `stroke`, `stroke-opacity`,
  `icon-color`, `icon-opacity`, `label-color`, `label-opacity`, `icon-scale`,
  `icon-heading`, `icon-offset`

**GPX**

- Style properties: `stroke`, `stroke-opacity`, `stroke-width`

**TCX**

- Line properties: `totalTimeSeconds`, `distanceMeters`, `maxSpeed`,
  `avgHeartRate`, `maxHeartRate`, `avgSpeed`, `avgWatts`, `maxWatts`

This also emits the [geojson-coordinate-properties](https://github.com/mapbox/geojson-coordinate-properties) format
to include time and other attributes that apply to each coordinate of a LineString.

## CLI

Use [@tmcw/togeojson-cli](https://github.com/tmcw/togeojson-cli) to use this
software as a command-line tool.

## Node.js

Install it into your project with `npm install --save @tmcw/togeojson`.

```javascript
// using togeojson in nodejs

const tj = require("@tmcw/togeojson");
const fs = require("fs");
// node doesn't have xml parsing or a dom. use xmldom
const DOMParser = require("xmldom").DOMParser;

const kml = new DOMParser().parseFromString(fs.readFileSync("foo.kml", "utf8"));

const converted = tj.kml(kml);
```

## ES Modules

```javascript
// The ES Module provides named exports, to import kml, gpx,
// and other parts of the module by name.
import { kml } from "@tmcw/togeojson";
```

## Browser

```html
<script type="module">
  import { kml } from "https://unpkg.com/@tmcw/togeojson?module";

  fetch("test/data/linestring.kml")
    .then(function (response) {
      return response.text();
    })
    .then(function (xml) {
      console.log(kml(new DOMParser().parseFromString(xml, "text/xml")));
    });
</script>
```

### KML Feature Support

- [x] Point
- [x] Polygon
- [x] LineString
- [x] name & description
- [x] ExtendedData
- [x] SimpleData
- [x] MultiGeometry -> GeometryCollection
- [x] Styles with hashing
- [x] Tracks & MultiTracks with `gx:coords`, including altitude
- [x] [TimeSpan](https://developers.google.com/kml/documentation/kmlreference#timespan)
- [x] [TimeStamp](https://developers.google.com/kml/documentation/kmlreference#timestamp)
- [ ] NetworkLinks
- [ ] GroundOverlays

### GPX Feature Support

- [x] Line Paths
- [x] Line styles
- [ ] Properties
  - [x] 'name', 'cmt', 'desc', 'link', 'time', 'keywords', 'sym', 'type' tags
  - [x] gpxx Garmin extensions on tracks and routes
  - [ ] 'author', 'copyright' tags

## FAQ

### How does this differ from mapbox/togeojson?

- This repository is maintained.
- It’s available as an ES Module. If you're using a modern JavaScript bundler or
  using ES Modules in the browser, this makes it a bit more efficient and sometimes
  easier to use.
- Conversion methods are available as generators, which makes the conversion of big
  files more efficient.
- The command line utility was moved to [tmcw/togeojson-cli](https://github.com/tmcw/togeojson-cli),
  which lets this module enjoy reduced dependencies: installing @tmcw/togeojson doesn’t
  require any other dependencies.
- The hashing method is improved, which means that parsing is the same between browsers and
  Node.js, and there are no runtime dependencies.

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

Have a string of XML and need an XML DOM? There are two main options:

- Use [xmldom](https://www.npmjs.com/package/@xmldom/xmldom), a JavaScript module that contains its own XML parser
- Use [`DOMParser`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser), the native platform XML parser

We recommend that **you use xmldom**, not the platform. DOMParser requires XML to be valid, which means that any XML namespaces that a KML, GPX, or TCX file contains are valid. A lot of existing data is invalid XML, and will be parsed only in part by DOMParser, but can be fully parsed by xmldom.

Using xmldom (recommended):

```js
const xmldom = require("@xmldom/xmldom");
const dom = new xmldom.DOMParser().parseFromString(xmlStr, "text/xml");
```

Using DOMParser:

```js
var dom = new DOMParser().parseFromString(xmlStr, "text/xml");
```

---

[![Maintainability](https://api.codeclimate.com/v1/badges/b3673a9a9f6e132ec991/maintainability)](https://codeclimate.com/github/placemark/togeojson/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/b3673a9a9f6e132ec991/test_coverage)](https://codeclimate.com/github/placemark/togeojson/test_coverage)
