/**
* Simple exception handling
*/

Exception = function( message ) {
	this.message = message || '';
	this.name = "Exception";
}

Exception.prototype.what = function() {
	return this.message;
}

