# Convert things to GeoJSON.

This converts less-cool formats to GeoJSON, so you can use GeoJSON. It's not
done yet. KML is first, GPX is second, GeoRSS is third. It'll be dependency-free
and compatible with any system that has an XML parser (IE7+) and probably
systems without one via polyfills (nodejs).

## KML

Supported:

* Point
* Polygon
* LineString
* name & description
* ExtendedData

Not supported yet:

* MultiGeometry
* Styles (may never be supported ever)

## FAQ

### Why isn't this built on OpenLayers

I tried, I tried. But KML relies on XML. Which relies on Classes, Projections,
their absurd OpenLayers.Function and OpenLayers.String classes, which rely
on Vector, and Geometry, and Point. They're all written with apidoc, littered
with trailing spaces, miles away from jshint compliant, and filled with
scope-creep that does nothing for me.

I'm sorry.

## Can it convert back?

No.
