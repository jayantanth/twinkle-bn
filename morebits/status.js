function Status( text, stat, type ) {
	this.text = this.codify(text);
	this.stat = this.codify(stat);
	this.type = type || 'status';
	this.generate(); 
	if( stat ) {
		this.render();
	}
}
Status.init = function( root ) {
	if( !( root instanceof Element ) ) {
		throw new Exception( 'object not an instance of Element' );
	}
	while( root.hasChildNodes() ) {
		root.removeChild( root.firstChild );
	}
	Status.root = root;

	var cssNode = document.createElement('style');
	cssNode.type = 'text/css';
	cssNode.rel = 'stylesheet';
	cssNode.appendChild( document.createTextNode("")); // Safari bugfix
	document.getElementsByTagName("head")[0].appendChild(cssNode);
	var styles = cssNode.sheet ? cssNode.sheet : cssNode.stylesSheet;
	styles.insertRule(".tw_status_status { color: SteelBlue; }", 0);
	styles.insertRule(".tw_status_info { color: ForestGreen; }", 0);
	styles.insertRule(".tw_status_warn { color: OrangeRed; }", 0);
	styles.insertRule(".tw_status_error { color: OrangeRed; font-weight: 900; }", 0);
}
Status.root = null;

Status.prototype = {
	stat: null,
	text: null,
	type: 'status',
	target: null,
	node: null,
	linked: false,
	link: function() {
		if( ! this.linked && Status.root ) {
			Status.root.appendChild( this.node );
			this.linked = true;
		}
	},
	unlink: function() {
		if( this.linked ) {
			Status.root.removeChild( this.node );
			this.linked = false;
		}
	},
	codify: function( obj ) {
		if ( ! ( obj instanceof Array ) ) {
			obj = [ obj ];
		}
		var result;
		result = document.createDocumentFragment();
		for( var i = 0; i < obj.length; ++i ) {
			if( typeof obj[i] == 'string' ) {
				result.appendChild( document.createTextNode( obj[i] ) );
			} else if( obj[i] instanceof Element ) {
				result.appendChild( obj[i] );
			} // Else cosmic radiation made something shit
		}
		return result;

	},
	update: function( status, type ) {
		this.stat = this.codify( status );
		if( type ) {
			this.type = type;
		}
		this.render();
	},
	generate: function() {
		this.node = document.createElement( 'div' );
		this.node.appendChild( document.createElement('span') ).appendChild( this.text );
		this.node.appendChild( document.createElement('span') ).appendChild( document.createTextNode( ': ' ) );
		this.target = this.node.appendChild( document.createElement( 'span' ) );
		this.target.appendChild(  document.createTextNode( '' ) ); // dummy node
	},
	render: function() {
		this.node.className = 'tw_status_' + this.type;
		while( this.target.hasChildNodes() ) {
			this.target.removeChild( this.target.firstChild );
		}
		this.target.appendChild( this.stat );
		this.link();
	},
	status: function( status ) {
		this.update( status, 'status');
	},
	info: function( status ) {
		this.update( status, 'info');
	},
	warn: function( status ) {
		this.update( status, 'warn');
	},
	error: function( status ) {
		this.update( status, 'error');
	}
}

Status.status = function( text, status ) {
	return new Status( text, status, 'status' );
}
Status.info = function( text, status ) {
	return new Status( text, status, 'info' );
}
Status.warn = function( text, status ) {
	return new Status( text, status, 'error' );
}
Status.error = function( text, status ) {
	return new Status( text, status, 'error' );
}

