if( typeof( TwinkleConfig ) == 'undefined' ) TwinkleConfig = {};
switch (skin)
{
	case 'vector':
		if( typeof( TwinkleConfig.portletArea ) == 'undefined' ) TwinkleConfig.portletArea = 'right-navigation';
		if( typeof( TwinkleConfig.portletId   ) == 'undefined' ) TwinkleConfig.portletId   = 'p-twinkle';
		if( typeof( TwinkleConfig.portletName ) == 'undefined' ) TwinkleConfig.portletName = 'TW';
		if( typeof( TwinkleConfig.portletType ) == 'undefined' ) TwinkleConfig.portletType = 'menu';
		if( typeof( TwinkleConfig.portletNext ) == 'undefined' ) TwinkleConfig.portletNext = 'p-search';
	  break;
	default:
		if( typeof( TwinkleConfig.portletId   ) == 'undefined' ) TwinkleConfig.portletId   = 'p-cactions';
	  break;
}

/**
 * Add a portlet menu to one of the navigation areas on the page.
 * This is necessarily quite a hack since skins, navigation areas, and
 * portlet menu types all work slightly different.
 *
 * Available navigation areas depend on the script used.
 * Monobook:
 *  "column-one", outer div class "portlet", inner div class "pBody". Existing portlets: "p-cactions", "p-personal", "p-logo", "p-navigation", "p-search", "p-interaction", "p-tb", "p-coll-print_export"
 *  Special layout of p-cactions and p-personal through specialized styles.
 * Vector:
 *  "mw-panel", outer div class "portal", inner div class "body". Existing portlets/elements: "p-logo", "p-navigation", "p-interaction", "p-tb", "p-coll-print_export"
 *  "left-navigation", outer div class "vectorTabs" or "vectorMenu", inner div class "" or "menu". Existing portlets: "p-namespaces", "p-variants" (menu)
 *  "right-navigation", outer div class "vectorTabs" or "vectorMenu", inner div class "" or "menu". Existing portlets: "p-views", "p-cactions" (menu), "p-search"
 *  Special layout of p-personal portlet (part of "head") through specialized styles.
 * Modern:
 *  "mw_contentwrapper" (top nav), outer div class "portlet", inner div class "pBody". Existing portlets or elements: "p-cactions", "mw_content"
 *  "mw_portlets" (sidebar), outer div class "portlet", inner div class "pBody". Existing portlets: "p-navigation", "p-search", "p-interaction", "p-tb", "p-coll-print_export"
 *
 * NOTE: If anyone is brave enough to reuse this directly, please shoot
 * me a note. Otherwise I might change the signature down the line and
 * your script breaks. Amalthea.
 *
 * @param String navigation -- id of the target navigation area (skin dependant, on vector either of "left-navigation", "right-navigation", or "mw-panel")
 * @param String id -- id of the portlet menu to create, preferably start with "p-".
 * @param String text -- name of the portlet menu to create. Visibility depends on the class used.
 * @param String type -- type of portlet. Currently only used for the vector non-sidebar portlets, pass "menu" to make this portlet a drop down menu.
 * @param Node nextnodeid -- the id of the node before which the new item should be added, should be another item in the same list, or undefined to place it at the end.
 *
 * @return Node -- the DOM node of the new item (a DIV element) or null
 */
function twAddPortlet( navigation, id, text, type, nextnodeid )
{
	//sanity checks, and get required DOM nodes
	var root = document.getElementById( navigation );
	if ( !root ) return null;
	
	var item = document.getElementById( id );
	if (item)
	{
		if (item.parentNode && item.parentNode==root) return item;
		return null;
	}

	var nextnode;
	if (nextnodeid) nextnode = document.getElementById(nextnodeid);

	//Add styles we might need.
  if (!twAddPortlet.styleAdded)
  {
  	if (skin=="vector") appendCSS( "div div.extraMenu h5 span { background-position: 90% 50%;} div.extraMenu h5 a { padding-left: 0.4em; padding-right: 0.4em; width:auto; } div.extraMenu h5 a span {display:inline-block; font-size:0.8em; height:2.5em; font-weight: normal; padding-top: 1.25em; margin-right:14px; }" );
  	else if (skin=="modern") appendCSS("#mw_contentwrapper div.portlet { overflow:hidden; height:1.5em; margin:0 0 0 14em; padding:0; } #mw_contentwrapper div.portlet h5 {display:none;} #mw_contentwrapper div.portlet div.pBody {margin:0; padding:0;} #mw_contentwrapper div.portlet div.pBody ul { display:inline; margin:0; } #mw_contentwrapper div.portlet div.pBody ul li { display:block; float:left; height:1.5em; margin:0 0.5em; padding:0 0.2em; text-transform:lowercase; } #mw_contentwrapper div.portlet div.pBody ul li a { text-decoration:underline;} #mw_contentwrapper div.portlet div.pBody ul li.selected a { text-decoration:none;}");
  	twAddPortlet.styleAdded = true;
  }

	//verify/normalize input
	type = skin=="vector" && type=="menu" && (navigation=="left-navigation" || navigation=="right-navigation")?"menu":"";
	var outerDivClass;
	var innerDivClass;
	switch (skin)
	{
		case "vector":
			if (navigation!="portal" && navigation!="left-navigation" && navigation!="right-navigation") navigation="mw-panel";
			outerDivClass = navigation=="mw-panel"?"portal":(type=="menu"?"vectorMenu extraMenu":"vectorTabs extraMenu");
			innerDivClass = navigation=="mw-panel"?'body':(type=='menu'?'menu':'');
			break;
		case "modern":
			if (navigation!="mw_portlets" && navigation!="mw_contentwrapper") navigation="mw_portlets";
			outerDivClass = "portlet";
			innerDivClass = "pBody";
			break;
		default:
			navigation="column-one";
			outerDivClass = "portlet";
			innerDivClass = "pBody";
			break;
	}

	//Build the DOM elements.
	var outerDiv = document.createElement( 'div' );
	outerDiv.className = outerDivClass+" emptyPortlet";
	outerDiv.id = id;
	var nextnode;
	if ( nextnode && nextnode.parentNode==root ) root.insertBefore( outerDiv, nextnode );
	else root.appendChild( outerDiv );

	var h5 = document.createElement( 'h5' );
	if (type=='menu')
	{
		var span = document.createElement( 'span' );
		span.appendChild( document.createTextNode( text ) );
		h5.appendChild( span );
		
		var a = document.createElement( 'a' );
		a.href = "#";
		var span = document.createElement( 'span' );
		span.appendChild( document.createTextNode( text ) );
		a.appendChild( span );
		h5.appendChild( a );
	}
	else h5.appendChild( document.createTextNode( text ) );
	outerDiv.appendChild( h5 );
	
	var innerDiv = document.createElement( 'div' ); //not strictly necessary with type vectorTabs, or other skins.
	innerDiv.className = innerDivClass;
	outerDiv.appendChild(innerDiv);
	
	var ul = document.createElement( 'ul' );
	innerDiv.appendChild( ul );

	return outerDiv;
}

//Build a portlet menu if it doesn't exist yet, and add the portlet link.
function twAddPortletLink( href, text, id, tooltip, accesskey, nextnode )
{
	if (TwinkleConfig.portletArea) twAddPortlet(TwinkleConfig.portletArea, TwinkleConfig.portletId, TwinkleConfig.portletName, TwinkleConfig.portletType, TwinkleConfig.portletNext);
	addPortletLink( TwinkleConfig.portletId, href, text, id, tooltip, accesskey, nextnode );
}

