Bytes = function ( value ) {
	if( typeof(value) == 'string' ) {
		var res = /(\d+) ?(\w?)(i?)B?/.exec( value );
		var number = res[1];
		var mag = res[2];
		var si = res[3];

		if( ! number ) {
			this.number = 0;
			return;
		}

		if( !si ) {
			this.value = number * Math.pow( 10, Bytes.magnitudes[mag] * 3 );
		} else {
			this.value = number * Math.pow( 2, Bytes.magnitudes[mag] * 10 );
		}
	} else {
		this.value = value;
	}
}

Bytes.magnitudes = {
	'': 0,
	'K': 1,
	'M': 2,
	'G': 3,
	'T': 4,
	'P': 5,
	'E': 6,
	'Z': 7,
	'Y': 8
}
Bytes.rmagnitudes = {
	0: '',
	1: 'K',
	2: 'M',
	3: 'G',
	4: 'T',
	5: 'P',
	6: 'E',
	7: 'Z',
	8: 'Y'
}

Bytes.prototype.valueOf = function() {
	return this.value;
}

Bytes.prototype.toString = function( magnitude ) {
	var tmp = this.value;
	if( magnitude ) {
		var si = /i/.test(magnitude);
		var mag = magnitude.replace( /.*?(\w)i?B?.*/g, '$1' );
		if( si ) {
			tmp /= Math.pow( 2, Bytes.magnitudes[mag] * 10 );
		} else {
			tmp /= Math.pow( 10, Bytes.magnitudes[mag] * 3 );
		}
		if( parseInt( tmp ) != tmp ) {
			tmp = (new Number( tmp ) ).toPrecision( 4 );
		}
		return tmp + ' ' + mag + (si?'i':'') +  'B';
	} else {
		// si per default
		var current = 0;
		while( tmp >= 1024 ) {
			tmp /= 1024;
			++current;
		}
		tmp = this.value / Math.pow( 2, current * 10 );
		if( parseInt( tmp ) != tmp ) {
			tmp = (new Number( tmp ) ).toPrecision( 4 );
		}
		return tmp + ' ' + Bytes.rmagnitudes[current] + ( current > 0 ? 'iB' : 'B' );
	}

}
