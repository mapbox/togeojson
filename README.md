# Convert things to GeoJSON.

This converts less-cool formats to GeoJSON, so you can use GeoJSON.

## FAQ

### Why isn't this built on OpenLayers

I tried, I tried. But KML relies on XML. Which relies on Classes, Projections,
their absurd OpenLayers.Function and OpenLayers.String classes, which rely
on Vector, and Geometry, and Point. They're all written with apidoc, littered
with trailing spaces, miles away from jshint compliant, and filled with
scope-creep that does nothing for me.

I'm sorry.
