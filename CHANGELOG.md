# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.7.0](https://github.com/tmcw/togeojson/compare/v4.6.1...v4.7.0) (2022-03-08)


### Features

* Support gx:CascadingStyle ([600c542](https://github.com/tmcw/togeojson/commit/600c542b016684066fb31107c5896bedad0b5329))

### [4.6.1](https://github.com/tmcw/togeojson/compare/v4.6.1-1...v4.6.1) (2022-03-07)

### [4.6.1-1](https://github.com/tmcw/togeojson/compare/v4.6.1-0...v4.6.1-1) (2022-03-07)


### Bug Fixes

* Typo ([9cb1ed0](https://github.com/tmcw/togeojson/commit/9cb1ed06ffcd60954c629838d0cc5ba8df3aa953))

### [4.6.1-0](https://github.com/tmcw/togeojson/compare/v4.6.0...v4.6.1-0) (2022-03-07)


### Bug Fixes

* Make module system more convoluted ([845ff7a](https://github.com/tmcw/togeojson/commit/845ff7a2c08220d8b87860231b262709d8db070a))

## [4.6.0](https://github.com/tmcw/togeojson/compare/v4.5.0...v4.6.0) (2022-03-07)


### Features

* Support additional GPX extensions ([ae2f00f](https://github.com/tmcw/togeojson/commit/ae2f00f685f5fd1e74b19864b0bba8211310d31a))

## [4.5.0](https://github.com/tmcw/togeojson/compare/v4.4.1...v4.5.0) (2021-08-03)


### Features

* Load TCX Courses ([#53](https://github.com/tmcw/togeojson/issues/53)) ([8924925](https://github.com/tmcw/togeojson/commit/89249255bd86d8c38e855f14b62fffad3f556abf))

### [4.4.1](https://github.com/tmcw/togeojson/compare/v4.4.0...v4.4.1) (2021-04-27)


### Bug Fixes

* Rename heartRates coordinate property to heart ([#48](https://github.com/tmcw/togeojson/issues/48)) ([8fc03f2](https://github.com/tmcw/togeojson/commit/8fc03f2a65ab01a53b81564f7ed6fac2a66452ad))

## [4.4.0](https://github.com/tmcw/togeojson/compare/v4.3.0...v4.4.0) (2021-03-31)


### Features

* Add coordinate properties  for times and heartRates ([#47](https://github.com/tmcw/togeojson/issues/47)) ([5e3958b](https://github.com/tmcw/togeojson/commit/5e3958b18509a85eba4b9b78ef5095b01d7dc213))

## [4.3.0](https://github.com/tmcw/togeojson/compare/v4.2.0...v4.3.0) (2020-12-28)


### Features

* Add heartRates to geojson properties for tcx files ([#42](https://github.com/tmcw/togeojson/issues/42)) ([ecde092](https://github.com/tmcw/togeojson/commit/ecde09219abdb507527f70358a400c799b01c2d1))

## [4.2.0](https://github.com/tmcw/togeojson/compare/v4.1.0...v4.2.0) (2020-09-05)


### Features

* Preserve GPX linestring type in a _gpxType property that is either rte or trk ([54fa558](https://github.com/tmcw/togeojson/commit/54fa5581a99095f87ccfe937c6da539f6b7d9995))
* TCX Support ([6df0878](https://github.com/tmcw/togeojson/commit/6df087891dffa06474479b17fc0595110ff76b3e))

## [4.1.0](https://github.com/tmcw/togeojson/compare/v4.0.0...v4.1.0) (2020-06-13)


### Features

* Add LabelStyle support and complete IconStyle support for KML ([f920b16](https://github.com/tmcw/togeojson/commit/f920b16493a79b7d5370a940387ae77386a00771))

## [4.0.0](https://github.com/tmcw/togeojson/compare/v3.2.0...v4.0.0) (2020-04-05)


### ⚠ BREAKING CHANGES

* Previously, togeojson would ignore Placemarks that did not have
associated geometry. [Per the GeoJSON
specification](https://tools.ietf.org/html/rfc7946#section-3.2),
Feature objects can have null geometries. After this change, togeojson
will output features with null geometries as the translation of KML
Placemarks with no geometry, instead of ommitting those items entirely.

## [3.2.0](https://github.com/tmcw/togeojson/compare/v3.1.0...v3.2.0) (2019-12-29)


### Features

* add garmin extension handling ([2e95798](https://github.com/tmcw/togeojson/commit/2e9579839bc294ad08cf83127e498bc27749eb81))

<a name="3.1.0"></a>
# [3.1.0](https://github.com/tmcw/togeojson/compare/v3.0.1...v3.1.0) (2019-12-25)


### Features

* Add parsing of GPX extensions speed, course, hAcc, vAcc ([#18](https://github.com/tmcw/togeojson/issues/18)) ([99301bd](https://github.com/tmcw/togeojson/commit/99301bd))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/tmcw/togeojson/compare/v3.0.0...v3.0.1) (2019-06-17)


### Bug Fixes

* Typo in rollup configuration ([1af08f6](https://github.com/tmcw/togeojson/commit/1af08f6))



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
