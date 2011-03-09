/**
 * Quickform is a class for creation of simple and standard forms without much 
 * specific coding.
 */

QuickForm = function QuickForm( event, eventType ) {

	this.root = new QuickForm.element( { type: 'form', event: event, eventType:eventType } );

	var cssNode = document.createElement('style');
	cssNode.type = 'text/css';
	cssNode.rel = 'stylesheet';
	cssNode.appendChild( document.createTextNode("")); // Safari bugfix
	document.getElementsByTagName("head")[0].appendChild(cssNode);
	var styles = cssNode.sheet ? cssNode.sheet : cssNode.stylesSheet;
	styles.insertRule("form.quickform { width: 96%; margin:auto; padding: .5em; vertical-align: middle}", 0);
	styles.insertRule("form.quickform * { font-family: sans-serif; vertical-align: middle}", 0);
	styles.insertRule("form.quickform select { width: 30em; border: 1px solid gray; font-size: 1.1em}", 0);
	styles.insertRule("form.quickform h5 { border-top: 1px solid gray;}", 0);
	styles.insertRule("form.quickform textarea { width: 100%; height: 6em }", 0);
	styles.insertRule("form.quickform .tooltipButtonContainer { position: relative; width: 100%; }", 0);
	styles.insertRule("form.quickform .tooltipButton { padding: .2em; color: blue; font-weight: bold; cursor:help;}", 0);
	styles.insertRule(".quickformtooltip { z-index: 200; position: absolute; padding: .1em; border: 1px dotted red; background-color: Linen; font: caption; font-size: 10pt; max-width: 800px}", 0);
}

QuickForm.prototype.render = function QuickFormRender() {
	var ret = this.root.render();
	ret.names = {};
	return ret;

}
QuickForm.prototype.append = function QuickFormAppend( data ) {
	return this.root.append( data );
}

QuickForm.element = function QuickFormElement( data ) {
	this.data = data;
	this.childs = [];
	this.id = QuickForm.element.id++;
}

QuickForm.element.id = 0;

QuickForm.element.prototype.append = function QuickFormElementAppend( data ) {
	if( data instanceof QuickForm.element ) {
		var child = data;
	} else {
		var child = new QuickForm.element( data );
	}
	this.childs.push( child );
	return child;
}

QuickForm.element.prototype.render = function QuickFormElementRender() {
	var currentNode = this.compute( this.data );

	for( var i = 0; i < this.childs.length; ++i ) {
		currentNode[1].appendChild( this.childs[i].render() );
	}
	return currentNode[0];
}

QuickForm.element.prototype.compute = function QuickFormElementCompute( data, in_id ) {
	var node;
	var childContainder = null;
	var label;
	var id = ( in_id ? in_id + '_' : '' ) + 'node_' + this.id;
	if( data.adminonly && !userIsInGroup( 'sysop' ) ) {
		// hell hack alpha
		data.type = hidden;
	}
	switch( data.type ) {
	case 'form':
		node = document.createElement( 'form' );
		node.setAttribute( 'name', 'id' );
		node.className = "quickform";
		node.setAttribute( 'action', 'javascript:void(0);');
		if( data.event ) {
			node.addEventListener( data.eventType || 'submit', data.event , false );
		}
		break;
	case 'select':
		node = document.createElement( 'div' );

		node.setAttribute( 'id', 'div_' + id );
		if( data.label ) {
			label = node.appendChild( document.createElement( 'label' ) );
			label.setAttribute( 'for', id );
			label.appendChild( document.createTextNode( data.label ) );
		}
		var select = node.appendChild( document.createElement( 'select' ) );
		if( data.event ) {
			select.addEventListener( 'change', data.event, false );
		}
		if( data.multiple ) {
			select.setAttribute( 'multiple', 'multiple' );
		}
		if( data.size ) {
			select.setAttribute( 'size', data.size );
		}
		select.setAttribute( 'name', data.name );

		if( data.list ) {
			for( var i = 0; i < data.list.length; ++i ) {

				var current = data.list[i];

				if( current.list ) {
					current.type = 'optgroup';
				} else {
					current.type = 'option';
				}

				var res = this.compute( current );
				select.appendChild( res[0] );
			}
		}
		childContainder = select;
		break;
	case 'option':
		node = document.createElement( 'option' );
		node.values = data.value;
		node.setAttribute( 'value', data.value );
		if( data.selected ) {
			node.setAttribute( 'selected', 'selected' );
		}
		if( data.disabled ) {
			node.setAttribute( 'disabled', 'disabled' );
		}
		node.setAttribute( 'label', data.label );
		node.appendChild( document.createTextNode( data.label ) );
		break;
	case 'optgroup':
		node = document.createElement( 'optgroup' );
		node.setAttribute( 'label', data.label );

		if( data.list ) {
			for( var i = 0; i < data.list.length; ++i ) {

				var current = data.list[i];

				current.type = 'option'; //must be options here

				var res = this.compute( current );
				node.appendChild( res[0] );
			}
		}
		break;
	case 'field':
		node = document.createElement( 'fieldset' );
		label = node.appendChild( document.createElement( 'legend' ) );
		label.appendChild( document.createTextNode( data.label ) );
		if( data.name ) {
			node.setAttribute( 'name', data.name );
		}
		break;
	case 'checkbox':
	case 'radio':
		node = document.createElement( 'div' );
		if( data.list ) {
			for( var i = 0; i < data.list.length; ++i ) {
				var cur_id = id + '_' + i;
				var current = data.list[i];
				if( current.type == 'header' ) {
					// inline hack
					cur_node = node.appendChild( document.createElement( 'h6' ) );
					cur_node.appendChild( document.createTextNode( current.label ) );
					if( current.tooltip ) {
						QuickForm.element.generateTooltip( cur_node , current );
					}
					continue;
				}
				cur_node = node.appendChild( document.createElement( 'div' ) );
				var input = cur_node.appendChild( document.createElement( 'input' ) );
				input.values = current.value;
				input.setAttribute( 'value', current.value );
				input.setAttribute( 'name', current.name || data.name );
				input.setAttribute( 'type', data.type );
				input.setAttribute( 'id', cur_id );


				if( current.checked ) {
					input.setAttribute( 'checked', 'checked' );
				}
				if( current.disabled ) {
					input.setAttribute( 'disabled', 'disabled' );
				}
				if( data.event ) {
					input.addEventListener( 'change', data.event, false );
				} else if ( current.event ) {
					input.addEventListener( 'change', current.event, true );
				}
				var label = cur_node.appendChild( document.createElement( 'label' ) );
				label.appendChild( document.createTextNode( current.label ) );
				label.setAttribute( 'for', cur_id );
				if( current.tooltip ) {
					QuickForm.element.generateTooltip( label, current );
				}
				if( current.subgroup ) {
					var tmpgroup = current.subgroup;
					if( ! tmpgroup.type ) {
						tmpgroup.type = data.type;
					}
					tmpgroup.name = (current.name || data.name) + '.' +  tmpgroup.name;

					var subgroup =this.compute( current.subgroup, cur_id )[0];
					subgroup.style.marginLeft = '3em';
					input.subgroup = subgroup;
					input.shown = false;

					var event = function(e) {
						if( e.target.checked ) {
							e.target.parentNode.appendChild( e.target.subgroup );
							if( e.target.type == 'radio' ) {
								var name = e.target.name;
								if( typeof( e.target.form.names[name] ) != 'undefined' ) {
									e.target.form.names[name].parentNode.removeChild( e.target.form.names[name].subgroup );
								}
								e.target.form.names[name] = e.target;
							}
						} else {
							e.target.parentNode.removeChild( e.target.subgroup );
						}
					}
					input.addEventListener( 'change', event, true );
					if( current.checked ) {
						input.parentNode.appendChild( subgroup );
					}
				} else if( data.type == 'radio' ) {
					var event = function(e) {
						if( e.target.checked ) {
							var name = e.target.name;
							if( typeof( e.target.form.names[name] ) != 'undefined' ) {
								e.target.form.names[name].parentNode.removeChild( e.target.form.names[name].subgroup );
							}
							delete e.target.form.names[name];
						} 
					}
					input.addEventListener( 'change', event, true );
				}
			}
		}
		break;
	case 'input':
		node = document.createElement( 'div' );

		if( data.label ) {
			label = node.appendChild( document.createElement( 'label' ) );
			label.appendChild( document.createTextNode( data.label ) );
			label.setAttribute( 'for', id );
		}

		var input = node.appendChild( document.createElement( 'input' ) );
		if( data.value ) {
			input.setAttribute( 'value', data.value );
		}
		input.setAttribute( 'name', data.name );
		input.setAttribute( 'type', 'text' );
		if( data.size ) {
			input.setAttribute( 'size', data.size );
		}
		if( data.disabled ) {
			input.setAttribute( 'disabled', 'disabled' );
		}
		if( data.readonly ) {
			input.setAttribute( 'readonly', 'readonly' );
		}
		if( data.maxlength ) {
			input.setAttribute( 'maxlength', data.maxlength );
		}
		if( data.event ) {
			input.addEventListener( 'keyup', data.event, false );
		}
		break;
	case 'dyninput':
		var min = data.min || 1;
		var max = data.max || Infinity;

		node = document.createElement( 'div' );

		label = node.appendChild( document.createElement( 'h5' ) );
		label.appendChild( document.createTextNode( data.label ) );

		var listNode = node.appendChild( document.createElement( 'div' ) );

		var more = this.compute( {
				type: 'button',
				label: 'more',
				disabled: min >= max,
				event: function(e) {
					var area = e.target.area;
					var new_node =  new QuickForm.element( e.target.sublist );
					e.target.area.appendChild( new_node.render() );

					if( ++e.target.counter >= e.target.max ) {
						e.target.setAttribute( 'disabled', 'disabled' );
					}
					e.stopPropagation();
				}
			} );

		node.appendChild( more[0] );
		moreButton = more[1];


		var sublist = {
			type: '_dyninput_element',
			label: data.sublabel || data.label,
			name: data.name,
			value: data.value,
			size: data.size,
			remove: false,
			maxlength: data.maxlength,
			event: data.event
		}


		for( var i = 0; i < min; ++i ) {
			var elem = new QuickForm.element( sublist );
			listNode.appendChild( elem.render() );
		}
		sublist.remove = true;
		sublist.morebutton = moreButton;
		sublist.listnode = listNode;

		moreButton.sublist = sublist;
		moreButton.area = listNode;
		moreButton.max = max - min;
		moreButton.counter = 0;
		break;
	case '_dyninput_element': // Private, similar to normal input
		node = document.createElement( 'div' );

		if( data.label ) {
			label = node.appendChild( document.createElement( 'label' ) );
			label.appendChild( document.createTextNode( data.label ) );
			label.setAttribute( 'for', id );
		}

		var input = node.appendChild( document.createElement( 'input' ) );
		if( data.value ) {
			input.setAttribute( 'value', data.value );
		}
		input.setAttribute( 'name', data.name );
		input.setAttribute( 'type', 'text' );
		if( data.size ) {
			input.setAttribute( 'size', data.size );
		}
		if( data.maxlength ) {
			input.setAttribute( 'maxlength', data.maxlength );
		}
		if( data.event ) {
			input.addEventListener( 'keyup', data.event, false );
		}
		if( data.remove ) {
			var remove = this.compute( {
					type: 'button',
					label: 'remove',
					event: function(e) {
						var list = e.target.listnode;
						var node = e.target.inputnode;
						var more = e.target.morebutton;

						list.removeChild( node );
						--more.counter;
						more.removeAttribute( 'disabled' );
						e.stopPropagation();
					}
				} );
			node.appendChild( remove[0] );
			removeButton = remove[1];
			removeButton.inputnode = node;
			removeButton.listnode = data.listnode;
			removeButton.morebutton = data.morebutton;
		}
		break;
	case 'hidden':
		var node = document.createElement( 'input' );
		node.setAttribute( 'type', 'hidden' );
		node.values = data.value;
		node.setAttribute( 'value', data.value );
		node.setAttribute( 'name', data.name );
		break;
	case 'header':
		node = document.createElement( 'h5' );
		node.appendChild( document.createTextNode( data.label ) );
		break;
	case 'div':
		node = document.createElement( 'div' );
		break;
	case 'submit':
		node = document.createElement( 'span' );
		childContainder = node.appendChild(document.createElement( 'input' ));
		childContainder.setAttribute( 'type', 'submit' );
		if( data.label ) {
			childContainder.setAttribute( 'value', data.label );
		}
		childContainder.setAttribute( 'name', data.name || 'submit' );
		if( data.disabled ) {
			childContainder.setAttribute( 'disabled', 'disabled' );
		}
		break;
	case 'button':
		node = document.createElement( 'span' );
		childContainder = node.appendChild(document.createElement( 'input' ));
		childContainder.setAttribute( 'type', 'button' );
		if( data.label ) {
			childContainder.setAttribute( 'value', data.label );
		}
		childContainder.setAttribute( 'name', data.name );
		if( data.disabled ) {
			childContainder.setAttribute( 'disabled', 'disabled' );
		}
		if( data.event ) {
			childContainder.addEventListener( 'click', data.event, false );
		}
		break;
	case 'textarea':
		node = document.createElement( 'div' );
		if( data.label ) {
			label = node.appendChild( document.createElement( 'h5' ) );
			label.appendChild( document.createTextNode( data.label ) );
			label.setAttribute( 'for', id );
		}
		node.appendChild( document.createElement( 'br' ) );
		textarea = node.appendChild( document.createElement( 'textarea' ) );
		textarea.setAttribute( 'name', data.name );
		if( data.cols ) {
			textarea.setAttribute( 'cols', data.cols );
		}
		if( data.rows ) {
			textarea.setAttribute( 'rows', data.rows );
		}
		if( data.disabled ) {
			textarea.setAttribute( 'disabled', 'disabled' );
		}
		if( data.readonly ) {
			textarea.setAttribute( 'readonly', 'readonly' );
		}
		if( data.value ) {
			textarea.value = data.value;
		}
		break;

	}

	if( childContainder == null ) {
		childContainder = node;
	} 
	if( data.tooltip ) {
		QuickForm.element.generateTooltip( label || node , data );
	}

	if( data.extra ) {
		childContainder.extra = extra;
	}
	childContainder.setAttribute( 'id', data.id || id );

	return [ node, childContainder ];
}

QuickForm.element.generateTooltip = function QuickFormElementGenerateTooltip( node, data ) {
		var tooltipButtonContainer = node.appendChild( document.createElement( 'span' ) );
		tooltipButtonContainer.className = 'tooltipButtonContainer';
		var tooltipButton = tooltipButtonContainer.appendChild( document.createElement( 'span' ) );
		tooltipButton.className = 'tooltipButton';
		tooltipButton.appendChild( document.createTextNode( '?' ) );
		var tooltip = document.createElement( 'div' );
		tooltip.className = 'quickformtooltip';
		tooltip.appendChild( document.createTextNode( data.tooltip ) );
		tooltipButton.tooltip = tooltip;
		tooltipButton.showing = false;
		tooltipButton.interval = null;
		tooltipButton.addEventListener( 'mouseover', QuickForm.element.generateTooltip.display, false );
		tooltipButton.addEventListener( 'mouseout', QuickForm.element.generateTooltip.fade, false );

}
QuickForm.element.generateTooltip.display = function QuickFormElementGenerateTooltipDisplay(e) {
	window.clearInterval( e.target.interval );
	e.target.tooltip.style.setProperty( '-moz-opacity', 1, null);
	e.target.tooltip.style.setProperty( 'opacity', 1, null);
	e.target.tooltip.style.left = (e.pageX - e.layerX + 24) + "px";
	e.target.tooltip.style.top = (e.pageY - e.layerY + 12) + "px";
	document.body.appendChild( e.target.tooltip );
	e.target.showing = true;
}

QuickForm.element.generateTooltip.fade = function QuickFormElementGenerateTooltipFade( e ) {
	e.target.opacity = 1.2;
	e.target.interval  = window.setInterval(function(e){
			e.target.tooltip.style.setProperty( '-moz-opacity', e.target.opacity, null);
			e.target.tooltip.style.setProperty( 'opacity', e.target.opacity, null);
			e.target.opacity -= 0.1;
			if( e.target.opacity <= 0 ) {
				window.clearInterval( e.target.interval );
				document.body.removeChild( e.target.tooltip );e.target.showing = false;
			}
		},50,e);
}

