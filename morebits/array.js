Array.prototype.uniq = function arrayPrototypeUniq() {
	var result = [];
	for( var i = 0; i < this.length; ++i ) {
		var current = this[i];
		if( result.indexOf( current ) == -1 ) {
			result.push( current );
		}
	}
	return result;
}

Array.prototype.dups = function arrayPrototypeUniq() {
	var uniques = [];
	var result = [];
	for( var i = 0; i < this.length; ++i ) {
		var current = this[i];
		if( uniques.indexOf( current ) == -1 ) {
			uniques.push( current );
		} else {
			result.push( current );
		}
	}
	return result;
}

Array.prototype.chunk = function arrayChunk( size ) {
	if( typeof( size ) != 'number' || size <= 0 ) { // pretty impossible to do anything :)
		return [ this ]; // we return an array consisting of this array.
	}
	var result = [];
	var current;
	for(var i = 0; i < this.length; ++i ) {
		if( i % size == 0 ) { // when 'i' is 0, this is always true, so we start by creating one.
			current = [];
			result.push( current );
		}
		current.push( this[i] );
	}
    return result;
}

