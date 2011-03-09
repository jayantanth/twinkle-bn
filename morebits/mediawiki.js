Mediawiki = {};

Mediawiki.Template = {
	parse: function( text, start ) {
		var count = -1;
		var level = -1;
		var equals = -1;
		var current = '';
		var result = {
			name: '',
			parameters: {}
		};

		for( var i = start; i < text.length; ++i ) {
			var test3 = text.substr( i, 3 );
			if( test3 == '\{\{\{' ) {
				current += '\{\{\{';
				i += 2;
				++level;
				continue;
			}
			if( test3 == '\}\}\}' ) {
				current += '\}\}\}';
				i += 2;
				--level;
				continue;
			}
			var test2 = text.substr( i, 2 );
			if( test2 == '\{\{' || test2 == '\[\[' ) {
				current += test2;
				++i;
				++level;
				continue;
			}
			if( test2 == '\]\]' ) {
				current += test2;
				++i;
				--level;
				continue;
			}
			if( test2 == '\}\}' ) {
				current += test2;
				++i;
				--level;

				if( level <= 0 ) {
					if( count == -1 ) {
						result.name = current.substring(2).trim();
						++count;
					} else {
						if( equals != -1 ) {
							var key = current.substring( 0, equals ).trim();
							var value = current.substring( equals ).trim();
							result.parameters[key] = value;
							equals = -1;
						} else {
							result.parameters[count] = current;
							++count;
						}
					}
					break;
				}
				continue;
			}

			if( text.charAt(i) == '|' && level <= 0 ) {
				if( count == -1 ) {
					result.name = current.substring(2).trim();
					++count;
				} else {
					if( equals != -1 ) {
						var key = current.substring( 0, equals ).trim();
						var value = current.substring( equals + 1 ).trim();
						result.parameters[key] = value;
						equals = -1;
					} else {
						result.parameters[count] = current;
						++count;
					}
				}
				current = '';
			} else if( equals == -1 && text.charAt(i) == '=' && level <= 0 ) {
				equals = current.length;
				current += text.charAt(i);
			} else {
				current += text.charAt(i);
			}
		}

		return result;
	}
}

Mediawiki.Page = function mediawikiPage( text ) {
	this.text = text;
}


Mediawiki.Page.prototype = {
	text: '',
	removeLink: function( link_target ) {
		var first_char = link_target.substr( 0, 1 );
		var link_re_string = "[" + first_char.toUpperCase() + first_char.toLowerCase() + ']' +  RegExp.escape( link_target.substr( 1 ), true );
		var link_simple_re = new RegExp( "\\[\\[(" + link_re_string + ")\\|?\\]\\]", 'g' );
		var link_named_re = new RegExp( "\\[\\[" + link_re_string + "\\|(.+?)\\]\\]", 'g' );
		if( link_simple_re.test(this.text) ) {
			this.text = this.text.replace( link_simple_re, "$1" );
		} else {
			this.text = this.text.replace( link_named_re, "$1" );
		}
	},
	commentOutImage: function( image, reason ) {
		var unbinder = new Unbinder( this.text );
		unbinder.unbind( '<!--', '-->' );

		reason = reason ? ' ' + reason + ': ' : '';
		var first_char = image.substr( 0, 1 );
		var image_re_string = "[" + first_char.toUpperCase() + first_char.toLowerCase() + ']' +  RegExp.escape( image.substr( 1 ), true ); 

		/*
		 * Check for normal image links, i.e. [[Image:Foobar.png|...]]
		 * Will eat the whole link
		 */
		var links_re = new RegExp( "\\[\\[(?:[Ii]mage|[Ff]ile):\\s*" + image_re_string );
		var allLinks = unbinder.content.splitWeightedByKeys( '[[', ']]' ).uniq();
		for( var i = 0; i < allLinks.length; ++i ) {
			if( links_re.test( allLinks[i] ) ) {
				var replacement = '<!-- ' + reason + allLinks[i] + ' -->';
				unbinder.content = unbinder.content.replace( allLinks[i], replacement, 'g' );
			}
		}
		// unbind the newly created comments
		unbinder.unbind( '<!--', '-->' );
		
		/*
		 * Check for gallery images, i.e. instances that must start on a new line, eventually preceded with some space, and must include Image: prefix
		 * Will eat the whole line.
		 */
		var gallery_image_re = new RegExp( "(^\\s*(?:[Ii]mage|[Ff]ile):\\s*" + image_re_string + ".*?$)", 'mg' );
		unbinder.content.replace( gallery_image_re, "<!-- " + reason + "$1 -->" );

		// unbind the newly created comments
		unbinder.unbind( '<!--', '-->' );
		/*
		 * Check free image usages, for example as template arguments, might have the Image: prefix excluded, but must be preceeded by an |
		 * Will only eat the image name and the preceeding bar and an eventual named parameter
		 */
		var free_image_re = new RegExp( "(\\|\\s*(?:[\\w\\s]+\\=)?\\s*(?:(?:[Ii]mage|[Ff]ile):\\s*)?" + image_re_string + ")", 'mg' );
		unbinder.content.replace( free_image_re, "<!-- " + reason + "$1 -->" );

		// Rebind the content now, we are done!
		this.text = unbinder.rebind();
	},
	addToImageComment: function( image, data ) {
		var first_char = image.substr( 0, 1 );
		var image_re_string = "(?:[Ii]mage|[Ff]ile):\\s*[" + first_char.toUpperCase() + first_char.toLowerCase() + ']' +  RegExp.escape( image.substr( 1 ), true ); 
		var links_re = new RegExp( "\\[\\[" + image_re_string );
		var allLinks = this.text.splitWeightedByKeys( '[[', ']]' ).uniq();
		for( var i = 0; i < allLinks.length; ++i ) {
			if( links_re.test( allLinks[i] ) ) {
				var replacement = allLinks[i];
				// just put it at the end?
				replacement = replacement.replace( /\]\]$/, '|' + data + ']]' );
				this.text = this.text.replace( allLinks[i], replacement, 'g' );
			}
		}
		var gallery_re = new RegExp( "^(\\s*" + image_re_string + '.*?)\\|?(.*?)$', 'mg' );
		var replacement = "$1|$2 " + data;
		this.text = this.text.replace( gallery_re, replacement );
	},
	removeTemplate: function( template ) {
		var first_char = template.substr( 0, 1 );
		var template_re_string = "(?:[Tt]emplate:)?\\s*[" + first_char.toUpperCase() + first_char.toLowerCase() + ']' +  RegExp.escape( template.substr( 1 ), true ); 
		var links_re = new RegExp( "\\\{\\\{" + template_re_string );
		var allTemplates = this.text.splitWeightedByKeys( '{\{', '}}', [ '{{{', '}}}' ] ).uniq();
		for( var i = 0; i < allTemplates.length; ++i ) {
			if( links_re.test( allTemplates[i] ) ) {
				this.text = this.text.replace( allTemplates[i], '', 'g' );
			}
		}

	},
	getText: function() {
		return this.text;
	}
}

