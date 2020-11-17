# OS Transform

A set of JavaScript helper functions for transforming between British National Grid (EPSG:27700) and WGS84 (EPSG:4326) coordinate systems - as well as converting to/from OSGB Grid References.

## Installation

Requires [Proj4js](http://proj4js.org/) JavaScript library (which should be added as a source at the top of your HTML document).

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.5.0/proj4.js"></script>
<script src="os-transform.js"></script>
```

## Usage

### os.Transform.toLatLng()

**Description:** Return latlng from an input easting + northing.

**Parameters:**

`coordinates` `{object}`: The easting + northing to be transformed.<br>
`decimals` `{integer}`: [Optional | Default = 7] The specified number of decimal places.

```js
os.Transform.toLatLng({ ea: 337297, no: 503695 });
// Returns { lat: 54.4248023, lng: -2.9679342 }
```

### os.Transform.fromLatLng()

**Description:** Return easting + northing from an input latlng.

**Parameters:**

`coordinates` `{object}`: The latlng to be transformed.<br>
`decimals` `{integer}`: [Optional | Default = 2] The specified number of decimal places.

```js
os.Transform.fromLatLng({ lat: 54.4248023, lng: -2.9679342 });
// Returns { ea: 337297, no: 503695 }
```

### os.Transform.toGridRef()

**Description:** Return 1m grid reference [plain & encoded] from an input easting + northing.

**Parameters:**

`coordinates` `{object}`: The easting + northing to be converted.

```js
os.Transform.toGridRef({ ea: 337297, no: 503695 });
// Returns { text: "NY 37297 03695", html: "NY&thinsp;37297&thinsp;03695" }
```

### os.Transform.fromGridRef()

**Description:** Return easting + northing from an input 1m grid reference.

**Parameters:**

`gridref` `{string}`: The grid reference to be converted.

```js
os.Transform.fromGridRef("NY 37297 03695");
// Returns { ea: 337297, no: 503695 }
```

## Change Log

**Version 0.1.0** (March 2020)
- Initial release.

**Version 0.2.0** (June 2020)
- Updated to include `_checkBounds()` function - to ensure input coordinates are within the permitted bounds (extent of GB).

## Licence

The contents of this repository are licensed under the [Open Government Licence 3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/)

![Logo](http://www.nationalarchives.gov.uk/images/infoman/ogl-symbol-41px-retina-black.png "OGL logo")
