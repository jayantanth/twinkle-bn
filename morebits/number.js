Number.prototype.zeroFill = function( length ) {
	var str = this.toFixed();
	if( !length ) { return str; }
	while( str.length < length ) { str = '0' + str; }
	return str;
}

