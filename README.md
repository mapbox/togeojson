# Convert things to GeoJSON.

[![Build Status](https://travis-ci.org/tmcw/togeojson.png)](https://travis-ci.org/tmcw/togeojson)

This converts [KML](https://developers.google.com/kml/documentation/) into
[GeoJSON](http://www.geojson.org/), in a browser or with [nodejs](http://nodejs.org/).

It is

* Dependency-free
* Tiny
* Written in vanilla javascript that's jshint-friendly
* Tested

It is not

* Concerned about ugly extensions to KML
* Concerned with having an 'internal format' of its own

    npm install togeojson

```javascript
// using togeojson in nodejs

var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use jsdom
    jsdom = require('jsdom').jsdom;

var converted = tj.kml(jsdom(fs.readFileSync('foo.kml', 'utf8')));
```

## KML

Supported:

* Point
* Polygon
* LineString
* name & description
* ExtendedData
* MultiGeometry with coalescing

Not supported yet:

* Styles (may never be supported ever)
* Various silly Google extensions (will never be supported)
* NetworkLinks (lol)

## FAQ

### What is coalescing?

KML's MultiGeometry type is a freeform geometry collection - you can have a single
feature with lines, points, polygons, and so on. GeoJSON doesn't have an equivalent,
so `togeojson` does its best:

* If the MultiGeometry is filled with the same type, it'll automatically derive a MultiLineString, a MultiPolygon or MultiPoint
* Otherwise, it'll derive a feature for each discrete geometry

### Why isn't this built on OpenLayers

I tried, I tried. But KML relies on XML. Which relies on Classes, Projections,
their absurd OpenLayers.Function and OpenLayers.String classes, which rely
on Vector, and Geometry, and Point. They're all written with apidoc, littered
with trailing spaces, miles away from jshint compliant, and filled with
scope-creep that does nothing for me.

I'm sorry.

## Can it convert back?

No.

## What about flyTo and other Google add-ons?

These will never be supported. These extensions make KML a case example of
[OGC](http://www.opengeospatial.org/)'s failure to make truly cross-compatible
formats - they shouldn't bow to vendors who want to customize formats for
proprietary software within their own, proprietary specifications,
while doing it under the banner of an open specification.
