function clone( obj, deep ) {
  var objectClone = new obj.constructor();
  for ( var property in obj )
    if ( !deep ) {
		objectClone[property] = obj[property];
	}
    else if ( typeof obj[property] == 'object' ) {
		objectClone[property] = clone( obj[property], deep );
	}
    else {
		objectClone[property] = obj[property];
	}
  return objectClone;
}

