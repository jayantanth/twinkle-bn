// Simple helper function to create a simple node
function htmlNode( type, content, color ) {
	var node = document.createElement( type );
	if( color ) {
		node.style.color = color;
	}
	node.appendChild( document.createTextNode( content ) );
	return node;
}

// A simple dragable window

function SimpleWindow( width, height ) {
	var stylesheet = document.createElement('style');
	stylesheet.type = 'text/css';
	stylesheet.rel = 'stylesheet';
	stylesheet.appendChild( document.createTextNode("") ); // Safari bugfix
	document.getElementsByTagName("head")[0].appendChild(stylesheet);
	var styles = stylesheet.sheet ? stylesheet.sheet : stylesheet.styleSheet;
	styles.insertRule(
		".simplewindow { "+
			"font: x-small sans-serif;"+
			"position: fixed; "+
			"background-color: AliceBlue; "+
			"border: 2px ridge Black; "+
			"z-index: 100; "+
			"}",
		0
	);

	styles.insertRule(
		".simplewindow .content { "+
			"position: absolute; "+
			"top: 20px; "+
			"bottom: 0; "+
			"overflow: auto; "+
			"width: 100%; "+
			"}",
		0
	);

	styles.insertRule(
		".simplewindow .resizebuttonhorizontal { "+
			"position: absolute; "+
			"background-color: MediumPurple; "+
			"opacity: 0.5; "+
			"right: -2px; "+
			"bottom: -2px; "+
			"width: 20px; "+
			"height: 4px; "+
			"cursor: se-resize; "+
			"}",
		0
	);
	styles.insertRule(
		".simplewindow .resizebuttonvertical { "+
			"position: absolute; "+
			"opacity: 0.5; "+
			"background-color: MediumPurple; "+
			"right: -2px; "+
			"bottom: -2px; "+
			"width: 4px; "+
			"height: 20px; "+
			"cursor: se-resize; "+
			"}",
		0
	);

	styles.insertRule( 
		".simplewindow .closebutton {"+
			"position: absolute; "+
			"font: 100 0.8em sans-serif; "+
			"top: 1px; "+
			"left: 1px; "+
			"height: 100%; "+
			"cursor: pointer; "+
			"}",
		0
	);

	styles.insertRule(
		".simplewindow .topbar { "+
			"position: absolute; "+
			"background-color: LightSteelBlue; "+
			"font: bold 1.2em sans-serif; "+
			"vertical-align: baseline; "+
			"text-align: center; "+
			"width: 100%; "+
			"height: 20px; "+
			"padding-top: 2px;"+
			"cursor: move; "+
			"}",
		0
	);

	this.width = width;
	this.height = height;

	var frame = document.createElement( 'div' );
	var content = document.createElement( 'div' );
	var topbar = document.createElement( 'div' );
	var title = document.createElement( 'span' );
	var closeButton = document.createElement( 'span' );
	var resizeButton2 = document.createElement( 'div' );
	var resizeButton1 = document.createElement( 'div' );

	this.frame = frame;
	this.title = title;
	this.content = content;

	frame.className = 'simplewindow';
	content.className = 'content';
	topbar.className = 'topbar';
	resizeButton1.className = 'resizebuttonvertical';
	resizeButton2.className = 'resizebuttonhorizontal';
	closeButton.className = 'closebutton';
	title.className = 'title';

	topbar.appendChild( closeButton );
	topbar.appendChild( title );
	frame.appendChild( topbar );
	frame.appendChild( content );
	frame.appendChild( resizeButton1 );
	frame.appendChild( resizeButton2 );

	frame.style.width = Math.min(parseInt(window.innerWidth), parseInt(width)) + 'px';
	frame.style.height = Math.min(parseInt(window.innerHeight), parseInt(height)) + 'px';
	frame.style.top = Math.max(0, parseInt( window.innerHeight - this.height  )/2 ) + 'px' ;
	frame.style.left = Math.max(0, parseInt( window.innerWidth - this.width  )/2 ) + 'px';
	var img = document.createElement( 'img' );
	img.src = "http://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Crystal_button_cancel.svg/18px-Crystal_button_cancel.svg.png";
	img.setAttribute("alt", "[close]");
	closeButton.appendChild( img );

	var self = this;

	// Specific events
	frame.addEventListener( 'mousedown', function(event) { self.focus(event); }, false );
	closeButton.addEventListener( 'click', function(event) {self.close(event); }, false );
	topbar.addEventListener( 'mousedown', function(event) {self.initMove(event); }, false );
	resizeButton1.addEventListener( 'mousedown', function(event) {self.initResize(event); }, false );
	resizeButton2.addEventListener( 'mousedown', function(event) {self.initResize(event); }, false );

	// Generic events
	window.addEventListener( 'mouseover', function(event) {self.handleEvent(event); }, false );
	window.addEventListener( 'mousemove', function(event) {self.handleEvent(event); }, false );
	window.addEventListener( 'mouseup', function(event) {self.handleEvent(event); }, false );
    this.currentState = this.initialState;    
}

SimpleWindow.prototype = {
	focusLayer: 100,
	width: 800,
	height: 600,
    initialState: "Inactive",
	currentState: null, // current state of finite state machine (one of 'actionTransitionFunctions' properties)
	focus: function(event) { 
		this.frame.style.zIndex = ++this.focusLayer;
	},
	close: function(event) {
		event.preventDefault();
		document.body.removeChild( this.frame );
	},
	initMove: function(event) {
		event.preventDefault();
		this.initialX = parseInt( event.clientX - this.frame.offsetLeft );
		this.initialY = parseInt( event.clientY - this.frame.offsetTop );
		this.frame.style.opacity = '0.5';
		this.currentState = 'Move';
	},
	initResize: function(event) {
		event.preventDefault();
		this.frame.style.opacity = '0.5';
		this.currentState = 'Resize';
	},
	handleEvent: function(event) { 
		event.preventDefault();
		var actionTransitionFunction = this.actionTransitionFunctions[this.currentState][event.type];
		if( !actionTransitionFunction ) {
			actionTransitionFunction = this.unexpectedEvent;
		}
		var nextState = actionTransitionFunction.call(this, event);
		if( !nextState ){
			nextState = this.currentState;
		}
        if( !this.actionTransitionFunctions[nextState] ){
			nextState = this.undefinedState(event, nextState);
		}
        this.currentState = nextState;
		event.stopPropagation();
    },
    unexpectedEvent: function(event) { 
		throw ("Handled unexpected event '" + event.type + "' in state '" + this.currentState);
        return this.initialState; 
    },  
   
    undefinedState: function(event, state) {
        throw ("Transitioned to undefined state '" + state + "' from state '" + this.currentState + "' due to event '" + event.type);
        return this.initialState; 
    },  
	actionTransitionFunctions: { 
        Inactive: {
            mouseover: function(event) { 
                return this.currentState;
            },
            mousemove: function(event) { 
                return this.currentState;
            },
            mouseup: function(event) { 
                return this.currentState;
            }
        }, 
        Move: {
            mouseover: function(event) { 
				this.moveWindow( event.clientX,  event.clientY );
                return this.currentState;
            },
            mousemove: function(event) { 
				return this.doActionTransition("Move", "mouseover", event);
            },
            mouseup: function(event) { 
				this.frame.style.opacity = '1';
                return 'Inactive';
            }
        }, 
		Resize: {
			mouseover: function(event) { 
				this.resizeWindow( event.clientX,  event.clientY );
				return this.currentState;
			},
			mousemove: function(event) { 
				return this.doActionTransition("Resize", "mouseover", event);
			},
			mouseup: function(event) { 
				this.frame.style.opacity = '1';
				return 'Inactive';
			}
		}
	},
	doActionTransition: function(anotherState, anotherEventType, event) {
         return this.actionTransitionFunctions[anotherState][anotherEventType].call(this,event);
    },
	display: function() {
		document.body.appendChild( this.frame );
	},
	setTitle: function( title ) {
		this.title.textContent = title;
	},
	setWidth: function( width ) {
		this.frame.style.width = width;
	},
	setHeight: function( height ) {
		this.frame.style.height = height;
	},
	setContent: function( content ) {
		this.purgeContent();
		this.addContent( content );
	},
	addContent: function( content ) {
		this.content.appendChild( content );
	},
	purgeContent: function( content ) {
		while( this.content.hasChildNodes() ) {
			this.content.removeChild( this.content.firstChild );
		}
	},
	moveWindow: function( x, y ) {
		this.frame.style.left = x - this.initialX + 'px';
		this.frame.style.top  = y - this.initialY + 'px';
	},
	resizeWindow: function( x, y ) {
		this.frame.style.height  = Math.max( parseInt( y - this.frame.offsetTop ), 200 ) + 'px';
		this.frame.style.width = Math.max( parseInt( x -  this.frame.offsetLeft ), 200 ) + 'px';
	}
}

