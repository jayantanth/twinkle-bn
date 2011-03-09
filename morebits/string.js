String.prototype.ltrim = function stringPrototypeLtrim( chars ) {
	chars = chars || "\\s*";
	return this.replace( new RegExp("^[" + chars + "]+", "g"), "" );
}

String.prototype.rtrim = function stringPrototypeRtrim( chars ) {
	chars = chars || "\\s*";
	return this.replace( new RegExp("[" + chars + "]+$", "g"), "" );
}
String.prototype.trim = function stringPrototypeTrim( chars ) {
	return this.rtrim(chars).ltrim(chars);
}

String.prototype.splitWeightedByKeys = function stringPrototypeSplitWeightedByKeys( start, end, skip ) {
	if( start.length != end.length ) {
		throw 'start marker and end marker must be of the same length';
	}
	var level = 0;
	var initial = null;
	var result = [];
	if( !( skip instanceof Array ) ) {
		if( typeof( skip ) == 'undefined' ) {
			skip = [];
		} else if( typeof( skip ) == 'string' ) {
			skip = [ skip ];
		} else {
			throw "non-applicable skip parameter";
		}
	}
	for( var i  = 0; i < this.length; ++i ) {
		for( var j = 0; j < skip.length; ++j ) {
			if( this.substr( i, skip[j].length ) == skip[j] ) {
				i += skip[j].length - 1;
				continue;
			}
		}
		if( this.substr( i, start.length ) == start ) {
			if( initial == null ) {
				initial = i;
			}
			++level;
			i += start.length - 1;
		} else if( this.substr( i, end.length ) == end ) {
			--level;
			i += end.length - 1;
		}
		if( level == 0 && initial != null ) {
			result.push( this.substring( initial, i + 1 ) );
			initial = null;
		}
	}

	return result;
}



// Helper functions to change case of a string
String.prototype.toUpperCaseFirstChar = function() {
	return this.substr( 0, 1 ).toUpperCase() + this.substr( 1 );
}

String.prototype.toLowerCaseFirstChar = function() {
	return this.substr( 0, 1 ).toLowerCase() + this.substr( 1 );
}

String.prototype.toUpperCaseEachWord = function( delim ) {
	delim = delim ? delim : ' ';
	return this.split( delim ).map( function(v) { return v.toUpperCaseFirstChar() } ).join( delim );
}

String.prototype.toLowerCaseEachWord = function( delim ) {
	delim = delim ? delim : ' ';
	return this.split( delim ).map( function(v) { return v.toLowerCaseFirstChar() } ).join( delim );
}

