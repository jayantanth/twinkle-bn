/**
* Maps the querystring to an object
*
* Functions:
*
* QueryString.exists(key)
*     returns true if the particular key is set
* QueryString.get(key)
*     returns the value associated to the key
* QueryString.equals(key, value)
*     returns true if the value associated with given key equals given value
* QueryString.toString()
*     returns the query string as a string
* QueryString.create( hash )
*     creates an querystring and encodes strings via encodeURIComponent and joins arrays with | 
*
* In static context, the value of location.search.substring(1), else the value given to the constructor is going to be used. The mapped hash is saved in the object.
*
* Example:
*
* var value = QueryString.get('key');
* var obj = new QueryString('foo=bar&baz=quux');
* value = obj.get('foo');
*/
function QueryString(qString) {
	this.string = qString;
	this.params = {};

	if( qString.length == 0 ) {
		return;
	}

	qString.replace(/\+/, ' ');
	var args = qString.split('&');

	for( var i = 0; i < args.length; ++i ) {
		var pair = args[i].split( '=' );
		var key = decodeURIComponent( pair[0] ), value = key;

		if( pair.length == 2 ) {
			value = decodeURIComponent( pair[1] );
		}

		this.params[key] = value;
	}
}

QueryString.static = null;

QueryString.staticInit = function() {
	if( QueryString.static == null ) {
		QueryString.static = new QueryString(location.search.substring(1));
	}
}

QueryString.get = function(key) {
	QueryString.staticInit();
	return QueryString.static.get(key);
};

QueryString.prototype.get = function(key) {
	return this.params[key] ? this.params[key] : null;
};

QueryString.exists = function(key) {
	QueryString.staticInit();
	return QueryString.static.exists(key);
}

QueryString.prototype.exists = function(key) {
	return this.params[key] ? true : false;
}

QueryString.equals = function(key, value) {
	QueryString.staticInit();
	return QueryString.static.equals(key, value);
}

QueryString.prototype.equals = function(key, value) {
	return this.params[key] == value ? true : false;
}

QueryString.toString = function() {
	QueryString.staticInit();
	return QueryString.static.toString();
}

QueryString.prototype.toString = function() {
	return this.string ? this.string : null;
}


QueryString.create = function( arr ) {
	var resarr = Array();
	var editToken;  // KLUGE: this should always be the last item in the query string (bug TW-B-0013)
	for( var i in arr ) {
		if( typeof arr[i] == 'undefined' ) {
			continue;
		}
		var res;
		if( arr[i] instanceof Array ){
			var v =  Array();
			for(var j = 0; j < arr[i].length; ++j ) {
				v[j] = encodeURIComponent( arr[i][j] );
			}
			res = v.join('|');
		} else {
			res = encodeURIComponent( arr[i] );
		}
                if( i == 'wpEditToken' ) {
                        editToken = res;
		} else {
			resarr.push( encodeURIComponent( i ) + '=' + res );
		}
	}
	if( typeof editToken != 'undefined' ) {
		resarr.push( 'wpEditToken=' + editToken );
	}
	return resarr.join('&');
}
QueryString.prototype.create = QueryString.create;

