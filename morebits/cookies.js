Cookies = {
	/*
	 * Creates an cookie with the name and value pair. expiry is optional or null and defaults
	 * to browser standard (in seconds), path is optional and defaults to "/"
	 * throws error if the cookie already exists.
	 */
	create: function( name, value, max_age, path ) {
		if( Cookies.exists( name ) ) {
			throw "cookie " + name + " already exists";
		}
		Cookies.set( name, value, max_age, path );
	},
	/*
	 * Sets an cookie with the name and value pair, overwrites any previous cookie of that name.
	 * expiry is optional or null and defaults to browser standard (in seconds),
	 * path is optional and defaults to /
	 */
	set: function( name, value, max_age, path ) {
		var cookie = name + "=" + encodeURIComponent( value );
		if( max_age ) {
			cookie += "; max-age=" + max_age;
		}
		cookie += "; path=" + path || "/";
		document.cookie = cookie;
	},
	/*
	 * Retuns the cookie with the name "name", return null if no cookie found.
	 */
	read: function( name ) {
		var cookies = document.cookie.split(";");
		for( var i = 0; i < cookies.length; ++i ) {
			var current = cookies[i];
			current = current.trim();
			if( current.indexOf( name + "=" ) == 0 ) {
				return decodeURIComponent( current.substring( name.length + 1 ) );
			}
		}
		return null;
	},
	/*
	 * Returns true if a cookie exists, false otherwise
	 */
	exists: function( name ) {
		var re = new RegExp( ";\\s*" + name + "=" );
		return re.test( document.cookie );
	},
	/*
	 * Deletes the cookie named "name"
	 */
	remove: function( name ) {
		Cookies.set( name, '', -1 );
	}
}

