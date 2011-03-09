/**
 * Use of this module by Twinkle:
 *   1. Twinkle specific functions related to configuration. These could possibly be moved to a new twinklecommon.js module.
 *   2. General classes related to use of the MediaWiki API. These classes are also used by many other user scripts
 *      so they should remain in this file. These classes are:
 *        Wikipedia.api – Invokes the actual MediaWiki API
 *        Wikipedia.page – Manages the details of the API including forming queries, handling edit tokens, 
 *                         page updates, and recovering from errors.
 *   3. Some date functions.
 *
 * This module should not be forked to avoid naming conflicts between the objects and functions 
 * within this module that is automatically loaded by many scripts and any forked copy.
 */

// Prevent double execution of this script when it is imported by multiple user scripts to improve performance
if (typeof(_morebits_js_loading) == 'undefined') {
_morebits_js_loading = true; // don't check this to see if initialization is complete, use morebits_js_loaded

var twinkleConfigExists = false;

if( userIsInGroup( 'sysop' ) || twUserIsWhitelisted() ) {
	twinkleConfigExists = true;
}
function twUserIsWhitelisted() {
	return userIsInGroup( 'autoconfirmed' ) || userIsInGroup( 'confirmed' );
}

