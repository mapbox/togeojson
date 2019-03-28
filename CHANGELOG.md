# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.0.0"></a>
# [3.0.0](https://github.com/tmcw/togeojson/compare/v2.0.0...v3.0.0) (2019-03-28)


### Code Refactoring

* switch from initializeArray to Array.fill ([#11](https://github.com/tmcw/togeojson/issues/11)) ([dac617a](https://github.com/tmcw/togeojson/commit/dac617a)), closes [#10](https://github.com/tmcw/togeojson/issues/10)


### BREAKING CHANGES

* this may modify browser support if you’re using
an old browser. See the MDN page for full details:

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill



<a name="2.0.0"></a>
# [2.0.0](https://github.com/tmcw/togeojson/compare/v1.0.0...v2.0.0) (2019-03-08)


### Features

* Generator methods, removed CLI ([f37a30b](https://github.com/tmcw/togeojson/commit/f37a30b))


### BREAKING CHANGES

* the cli that was previously installed along with togeojson has been removed, and will be installable as @tmcw/togeojson-cli

Other changes in this pass:

- Switch from microbundle to rollup to build
- Remove dependencies
- Remove reliance on XMLSerializer. This will make togeojson work in worker contexts.



<a name="1.0.0"></a>
# [1.0.0](https://github.com/tmcw/togeojson/compare/v1.0.0-alpha.1...v1.0.0) (2019-01-18)



<a name="1.0.0-alpha.1"></a>
# [1.0.0-alpha.1](https://github.com/tmcw/togeojson/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2019-01-18)



<a name="1.0.0-alpha.0"></a>
# [1.0.0-alpha.0](https://github.com/tmcw/togeojson/compare/v0.16.0...v1.0.0-alpha.0) (2019-01-18)



## 0.16.0

* Supports the `link` tag in GPX data.
* Supports the `type` tag for waypoints in GPX data.

## 0.15.0

* Supports the `cmt` (comment) tag in GPX data.

## 0.14.2

* Fixes a potential crash with QGIS-generated GPX files.

## 0.14.0

* Now includes TimeStamp property from Placemarks, if it exists.

## 0.13.0

* Added support for StyleMap elements in Google-flavored KML
* Improved test coverage
* Made `#` prefix for internal style references optional
* Uses `eslint` for code style uniformity

## 0.12.2

* Fix `#` prefix on exported hex colors

## 0.12.1

* Fix trackpoints with elevation=0 having their elevation skipped

## 0.12.0

* Fix rte based GPX based tracks
* Add CDATA support to KML

## 0.11.0

* Add heartrate support for GPX tracks
* Fix elevation support
* Fix test runner

## 0.10.1

* Fix an IE9 error: IE9 'supports' `XMLSerializer` inasmuch as it will create
  an instance that fails always and hard.

## 0.10.0

* Encode timestamps along lines in GPX and KML as a `coordTimes` property.

## 0.9.0

* Encode KML id attributes on Placemarks as GeoJSON Feature id properties.

## 0.8.0

* Support for the `gx:Track` and `gx:MultiTrack` extensions to GPX

## 0.7.0

* GPX conversion creates MultiLineString geometries when given multiple track segments.

## 0.6.0

* Support for [simplestyle spec](https://github.com/mapbox/simplestyle-spec) 1.1.0
* Tests in [tape](https://github.com/substack/tape) rather than mocha/expect.js

## 0.5.0

* Elevation values along linestrings and in points for GPX are now parsed
  correctly into `Z` coordinate values in GeoJSON.

## 0.4.2

* No longer bundles xmldom for browsers

## 0.3.1

* Stricter check for browser versus browserify when requiring `xmldom`

## 0.3.0

* Support for pipes and streams

```sh
echo "LineString(0 0, 10 10)" | wellknown | tokml | togeojson > map.geojson
```

## 0.2.0

* Improve documentation
* Make style hashing on by default, remove options object

## 0.1.1

* Fix global leak.

## 0.1.0

* Comments
* GPX Support

## 0.0.1

* Support GeometryCollections as themselves.
