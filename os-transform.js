// os-transform.js v0.3.0

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
     * Return 1m grid reference [plain & encoded] from an input easting + northing.
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

        return { text: text, html: html };
    },

    /**
     * Return easting + northing from an input 1m grid reference.
     * @param {string} gridref - The grid reference to be converted.
     */
    fromGridRef: function(gridref) {
        var res = gridref.split(' ');

        var e = Number(res[1]);
        var n = Number(res[2]);

        // 500km reference
        var t = res[0].substr(0, 1).toLowerCase();
        var s = 'stnohj';
        var i = s.indexOf(t);
        e = e + ((i % 2) * 500000);
        n = n + (parseInt(i / 2) * 500000);

        // 100km reference
        var t = res[0].substr(1, 1).toLowerCase();
        var s = 'vwxyzqrstulmnopfghjkabcde';
        var i = s.indexOf(t);
        e = e + ((i % 5) * 100000);
        n = n + (parseInt(i / 5) * 100000);

        return { ea: e, no: n };
    }
};
