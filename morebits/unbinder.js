Unbinder = function unbinder( string ) {
	if( typeof( string ) != 'string' ) {
		throw "not a string";
	}
	this.content = string;
	this.counter = 0;
	this.history = {};
	this.prefix = '%UNIQ::' + Math.random() + '::';
	this.postfix = '::UNIQ%';
}

Unbinder.prototype = {
  unbind: function UnbinderUnbind( prefix, postfix ) {
    var re = new RegExp( prefix + '(.*?)' + postfix, 'g' );
    this.content = this.content.replace( re, Unbinder.getCallback( this ) );
  },
  rebind: function UnbinderRebind() {
    var content = this.content;
    content.self = this;
    for( var current in this.history )
      if( this.history.hasOwnProperty( current ) )
        content = content.replace( current, this.history[current] );
    return content;
  },
  prefix: null, // %UNIQ::0.5955981644938324::
  postfix: null, // ::UNIQ%
  content: null, // string
  counter: null, // 0++
  history: null // {}
};

Unbinder.getCallback = function UnbinderGetCallback(self) {
  return function UnbinderCallback( match , a , b ) {
    var current = self.prefix + self.counter + self.postfix;
    self.history[current] = match;
    ++self.counter;
    return current;
  };
};

