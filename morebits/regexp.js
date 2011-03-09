/**
* Will escape a string to be used in a RegExp
*/
RegExp.escape = function( text, space_fix ) {

	if ( !arguments.callee.sRE ) {
		arguments.callee.sRE = /(\/|\.|\*|\+|\?|\||\(|\)|\[|\]|\{|\}|\\|\$|\^)/g;
	}

	text = text.replace( arguments.callee.sRE , '\\$1' );

	// Special Mediawiki escape, underscore/space is the same, often at lest:

	if( space_fix ) {
		text = text.replace( / |_/g, '[_ ]' );
	}

	return text;

}

