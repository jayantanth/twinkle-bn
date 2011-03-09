// Sprintf implementation based on perl similar
function sprintf() {
	if( arguments.length == 0 ) {
		throw "Not enough arguments for sprintf";
	}
	var result = "";
	var format = arguments[0];

	var index = 1;
	var current_index = 1;
	var flags = {};
	var in_operator = false;
	var relative = false;
	var precision = false;
	var fixed = false;
	var vector = false;
	var vector_delimiter = '.';


	for( var i = 0; i < format.length; ++i ) {
		var current_char = format.charAt(i);
		if( in_operator ) {
			switch( current_char ) {
			case 'i':
				current_char = 'd';
				break;
			case 'F':
				current_char = 'f';
				break;
			case '%':
			case 'c':
			case 's':
			case 'd':
			case 'u':
			case 'o':
			case 'x':
			case 'e':
			case 'f':
			case 'g':
			case 'X':
			case 'E':
			case 'G':
			case 'b':
				var value = arguments[current_index];
				if( vector ) {
					r = value.toString().split( '' );
					result += value.toString().split('').map( function( value ) {
							return sprintf.format( current_char, value.charCodeAt(), flags );
						}).join( vector_delimiter );
				} else {
					result += sprintf.format( current_char, value, flags );
				}
				if( !fixed ) {
					++index;
				}
				current_index = index;
				flags = {};
				relative = false;
				in_operator = false;
				precision = false;
				fixed = false;
				vector = false;
				vector_delimiter = '.';
				break;
			case 'v':
				vector = true;
				break;
			case ' ':
			case '0':
			case '-':
			case '+':
			case '#':
				flags[current_char] = true;
				break;
			case '*':
				relative = true;
				break;
			case '.':
				precision = true;
				break;
			}
			if( /\d/.test( current_char ) ) {
				var num = parseInt( format.substr( i ) );
				var len = num.toString().length;
				i += len - 1;
				var next = format.charAt( i  + 1 );
				if( next == '$' ) {
					if( num <= 0 || num >= arguments.length ) {
						throw "out of bound";
					}
					if( relative ) {
						if( precision ) {
							flags['precision'] = arguments[num];
							precision = false;
						} else if( format.charAt( i + 2 ) == 'v' ) {
							vector_delimiter = arguments[num];
						}else {
							flags['width'] = arguments[num];
						}
						relative = false;
					} else {
						fixed = true;
						current_index = num;
					}
					++i;
				} else if( precision ) {
					flags['precision'] = num;
					precision = false;
				} else {
					flags['width'] = num;
				}
			} else if ( relative && !/\d/.test( format.charAt( i + 1 ) ) ) {
				if( precision ) {
					flags['precision'] = arguments[current_index];
					precision = false;
				} else if( format.charAt( i + 1 ) == 'v' ) {
					vector_delimiter = arguments[current_index];
				} else {
					flags['width'] = arguments[current_index];
				}
				++index;
				if( !fixed ) {
					current_index++;
				}
				relative = false;
			}
		} else {
			if( current_char == '%' ) {
				in_operator = true;
				continue;
			} else {
				result += current_char;
				continue;
			}
		}
	}
	return result;
}

sprintf.format = function sprintfFormat( type, value, flags ) {

	// Similar to how perl printf works
	if( value == undefined ) {
		if( type == 's' ) {
			return '';
		} else {
			return '0';
		}
	}

	var result;
	var prefix = '';
	var fill = '';
	var fillchar = ' ';
	switch( type ) {
	case '%':
		result = '%';
		break;
	case 'c':
		result = String.fromCharCode( parseInt( value ) );
		break;
	case 's':
		result = value.toString();
		break;
	case 'd':
		result = parseInt( value ).toString();
		break;
	case 'u':
		result = Math.abs( parseInt( value ) ).toString(); // it's not correct, but JS lacks unsigned ints
		break;
	case 'o':
		result = (new Number( Math.abs( parseInt( value ) ) ) ).toString(8);
		break;
	case 'x':
		result = (new Number( Math.abs( parseInt( value ) ) ) ).toString(16);
		break;
	case 'b':
		result = (new Number( Math.abs( parseInt( value ) ) ) ).toString(2);
		break;
	case 'e':
		var digits = flags['precision'] ? flags['precision'] : 6;
		result = (new Number( value ) ).toExponential( digits ).toString();
		break;
	case 'f':
		var digits = flags['precision'] ? flags['precision'] : 6;
		result = (new Number( value ) ).toFixed( digits ).toString();
	case 'g':
		var digits = flags['precision'] ? flags['precision'] : 6;
		result = (new Number( value ) ).toPrecision( digits ).toString();
		break;
	case 'X':
		result = (new Number( Math.abs( parseInt( value ) ) ) ).toString(16).toUpperCase();
		break;
	case 'E':
		var digits = flags['precision'] ? flags['precision'] : 6;
		result = (new Number( value ) ).toExponential( digits ).toString().toUpperCase();
		break;
	case 'G':
		var digits = flags['precision'] ? flags['precision'] : 6;
		result = (new Number( value ) ).toPrecision( digits ).toString().toUpperCase();
		break;
	}

	if(flags['+'] && parseFloat( value ) > 0 && ['d','e','f','g','E','G'].indexOf(type) != -1 ) {
		prefix = '+';
	}

	if(flags[' '] && parseFloat( value ) > 0 && ['d','e','f','g','E','G'].indexOf(type) != -1 ) {
		prefix = ' ';
	}

	if( flags['#'] && parseInt( value ) != 0 ) {
		switch(type) {
		case 'o':
			prefix = '0';
			break;
		case 'x':
		case 'X':
			prefix = '0x';
			break;
		case 'b':
			prefix = '0b';
			break;
		}
	}

	if( flags['0'] && !flags['-'] ) {
		fillchar = '0';
	}

	if( flags['width'] && flags['width'] > ( result.length + prefix.length ) ) {
		var tofill = flags['width'] - result.length - prefix.length;
		for( var i = 0; i < tofill; ++i ) {
			fill += fillchar;
		}
	}

	if( flags['-'] && !flags['0'] ) {
		result += fill;
	} else {
		result = fill + result;
	}
	
	return prefix + result;
}

