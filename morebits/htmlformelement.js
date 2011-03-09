/*
 * returns an array containing the values of elements with the given name, that has it's
 * checked property set to true. (i.e. a checkbox or a radiobutton is checked), or select options
 * that have selected set to true. (don't try to mix selects with radio/checkboxes, please)
 * Type is optional and can specify if either radio or checkbox (for the event
 * that both checkboxes and radiobuttons have the same name.
 */
HTMLFormElement.prototype.getChecked = function( name, type ) {
	var elements = this.elements[name];
	if( !elements ) { 
		// if the element doesn't exists, return null.
		return null;
	}
	var return_array = [];
	if( elements instanceof HTMLSelectElement ) {
		var options = elements.options;
		for( var i = 0; i < options.length; ++i ) {
			if( options[i].selected ) {
				if( options[i].values ) {
					return_array.push( options[i].values );
				} else {
					return_array.push( options[i].value );
				}

			}
		}
	} else if( elements instanceof HTMLInputElement ) {
		if( type != null && elements.type != type ) {
			return [];
		} else if( elements.checked ) {
			return [ elements.value ];
		}
	} else {
		for( var i = 0; i < elements.length; ++i ) {
			if( elements[i].checked ) {
				if( type != null && elements[i].type != type ) {
					continue;
				}
				if( elements[i].values ) {
					return_array.push( elements[i].values );
				} else {
					return_array.push( elements[i].value );
				}
			}
		}
	}
	return return_array;
}

/*
 * returns an array containing the values of elements with the given name, that has non-empty strings
 * type is "text" or given.
 */
HTMLFormElement.prototype.getTexts = function( name, type ) {
	type == type || 'text';
	var elements = this.elements[name];
	if( !elements ) { 
		// if the element doesn't exists, return null.
		return null;
	}
	var return_array = [];
	for( var i = 0; i < elements.length; ++i ) {
		if( elements[i].value != '' ) {
			return_array.push( elements[i].value );
		}
	}
	return return_array;
}
