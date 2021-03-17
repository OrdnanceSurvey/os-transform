// os-transform.js v0.4.0

window.os = window.os || {};

os.Transform = {
    // Bounds object (projected and geographic coordinates) for extent of GB.
    _maxBounds: {
        projected: [[ 0.0, 0.0 ], [ 699999.9, 1299999.9 ]],
        geographic: [[ -8.74, 49.84 ], [ 1.96, 60.9 ]]
    },

    /**
     * Test whether coordinates are within the permitted bounds.
     * @param {object} coordinates - The easting + northing or latlng to be validated.
     */
    _checkBounds: function(coordinates) {
        var isValid = true;
        if( coordinates.hasOwnProperty('ea') && coordinates.hasOwnProperty('no') ) {
            if( (coordinates.ea < this._maxBounds.projected[0][0] || coordinates.ea > this._maxBounds.projected[1][0])
                || (coordinates.no < this._maxBounds.projected[0][1] || coordinates.no > this._maxBounds.projected[1][1]) ) {
                isValid = false;
            }
        }
        else if( coordinates.hasOwnProperty('lat') && coordinates.hasOwnProperty('lng') ) {
            if( (coordinates.lng < this._maxBounds.geographic[0][0] || coordinates.lng > this._maxBounds.geographic[1][0])
                || (coordinates.lat < this._maxBounds.geographic[0][1] || coordinates.lat > this._maxBounds.geographic[1][1]) ) {
                isValid = false;
            }
        }

        var message = isValid ? '' : 'Coordinates out of range.';

        return { valid: isValid, message: message };
    },

    /**
     * Test whether a standard grid reference with a valid format has been provided.
     * param {string} gridref - The grid reference to be validated.
     */
     _validateGridRef: function(gridref) {
        var regex = /^[THJONS][VWXYZQRSTULMNOPFGHJKABCDE] ?[0-9]{1,5} ?[0-9]{1,5}$/;
        var match = Array.isArray(gridref.toUpperCase().match(regex)) ? true : false;

        var isValid = (gridref.replaceAll(" ", "").length % 2 === 0) && match ? true: false;
        var message = isValid ? '' : 'Invalid grid reference.';

        return { valid: isValid, message: message };
    },

    /**
     * Return latlng from an input easting + northing.
     * @param {object} coordinates - The easting + northing to be transformed.
     * @param {integer} decimals - [optional] The specified number of decimal places.
     */
    toLatLng: function(coordinates, decimals = 7) {
        var test = this._checkBounds(coordinates)
        if(! test.valid ) {
           console.log(test.message);
           return {};
        }

        var point = proj4('EPSG:27700', 'EPSG:4326', [ coordinates.ea, coordinates.no ]);

        var lng = Number(point[0].toFixed(decimals));
        var lat = Number(point[1].toFixed(decimals));

        return { lat: lat, lng: lng };
    },

    /**
     * Return easting + northing from an input latlng.
     * @param {object} coordinates - The latlng to be transformed.
     * @param {integer} decimals - [optional] The specified number of decimal places.
     */
    fromLatLng: function(coordinates, decimals = 2) {
        var test = this._checkBounds(coordinates)
        if(! test.valid ) {
           console.log(test.message);
           return {};
        }

        var point = proj4('EPSG:4326', 'EPSG:27700', [ coordinates.lng, coordinates.lat ]);

        var e = Number(point[0].toFixed(decimals));
        var n = Number(point[1].toFixed(decimals));

        return { ea: e, no: n };
    },

    /**
     * Return grid reference [plain | encoded | components] from an input easting + northing.
     * @param {object} coordinates - The easting + northing to be converted.
     */
    toGridRef: function(coordinates) {
        var test = this._checkBounds(coordinates)
        if(! test.valid ) {
           console.log(test.message);
           return {};
        }

        var prefixes = [
            [ 'SV', 'SW', 'SX', 'SY', 'SZ', 'TV', 'TW' ],
            [ 'SQ', 'SR', 'SS', 'ST', 'SU', 'TQ', 'TR' ],
            [ 'SL', 'SM', 'SN', 'SO', 'SP', 'TL', 'TM' ],
            [ 'SF', 'SG', 'SH', 'SJ', 'SK', 'TF', 'TG' ],
            [ 'SA', 'SB', 'SC', 'SD', 'SE', 'TA', 'TB' ],
            [ 'NV', 'NW', 'NX', 'NY', 'NZ', 'OV', 'OW' ],
            [ 'NQ', 'NR', 'NS', 'NT', 'NU', 'OQ', 'OR' ],
            [ 'NL', 'NM', 'NN', 'NO', 'NP', 'OL', 'OM' ],
            [ 'NF', 'NG', 'NH', 'NJ', 'NK', 'OF', 'OG' ],
            [ 'NA', 'NB', 'NC', 'ND', 'NE', 'OA', 'OB' ],
            [ 'HV', 'HW', 'HX', 'HY', 'HZ', 'JV', 'JW' ],
            [ 'HQ', 'HR', 'HS', 'HT', 'HU', 'JQ', 'JR' ],
            [ 'HL', 'HM', 'HN', 'HO', 'HP', 'JL', 'JM' ]
        ];

        var x = Math.floor(coordinates.ea / 100000);
        var y = Math.floor(coordinates.no / 100000);

        var prefix = prefixes[y][x];

        var e = Math.floor(coordinates.ea % 100000); // Math.round(coordinates.ea % 100000);
        var n = Math.floor(coordinates.no % 100000); // Math.round(coordinates.no % 100000);

        e = String(e).padStart(5, '0');
        n = String(n).padStart(5, '0');

        var text = prefix + ' ' + e + ' ' + n,
            html = prefix + '&thinsp;' + e + '&thinsp;' + n;

        return { text: text, html: html, letters: prefix, eastings: e, northings: n };
    },

    /**
     * Return easting + northing from an input grid reference.
     * @param {string} gridref - The grid reference to be converted.
     */
    fromGridRef: function(gridref) {
        gridref = String(gridref).trim();

        var test = this._validateGridRef(gridref)
        if(! test.valid ) {
           console.log(test.message);
           return {};
        }

        var gridLetters = "VWXYZQRSTULMNOPFGHJKABCDE";

        var ref = gridref.toUpperCase().replaceAll(" ", "");

        var majorEasting = gridLetters.indexOf(ref[0]) % 5  * 500000 - 1000000;
        var majorNorthing = Math.floor(gridLetters.indexOf(ref[0]) / 5) * 500000 - 500000;

        var minorEasting = gridLetters.indexOf(ref[1]) % 5  * 100000;
        var minorNorthing = Math.floor(gridLetters.indexOf(ref[1]) / 5) * 100000;

        var i = (ref.length-2) / 2;
        var m = Math.pow(10, 5-i);

        var e = majorEasting + minorEasting + (ref.substr(2, i) * m);
        var n = majorNorthing + minorNorthing + (ref.substr(i+2, i) * m);

        return { ea: e, no: n };
    }
};
