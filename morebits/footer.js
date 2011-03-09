/*
*  Things to note: 
*       - The users listed in the twinkleblacklist array will *not* be able to use Twinkle, even if they have it enabled as a 
*         gadget. *However*, since javascript files are usually cached in the client's browser cache, it can take a while for
*         the blacklisting to come into effect - theoretically for up to 30 days, although usually with the next browser restart.
*       - The search method used the detect the usernames in this array is case-sensitive, so make sure that you get the
*         capitalization right!  Always capitalize the first letter of a username; this is how the software formats usernames.
*       - The users on this blacklist will remain so until they are removed.  The only way to restore one of these users' access to
*         Twinkle is to remove his/her name from the list. Even then, the user might need to [[WP:BYPASS]] his browser cache.
*       - Make sure that every username is wrapped in straight quotation marks ("" or ''), that quotation marks or apostrophes 
*         within the usernames are preceded by a backward-slash (\), and that every name EXCEPT THE LAST ONE is followed by a 
*         comma.  Not following these directions can cause the script to fail.
*              - Correct: http://en.wikipedia.org/w/index.php?title=User%3AAzaToth%2Fmorebits.js&diff=298609098&oldid=298609007 
*/

var twinkleBlacklistedUsers = ["Dilip rajeev", "Jackmantas", "Flaming Grunt", "Catterick", "44 sweet", "Sarangsaras", "WebHamster", "Radiopathy", "Nezzadar", "Darrenhusted", "Notpietru", "Arthur Rubin", "Wuhwuzdat", "MikeWazowski", "Lefty101", "Bender176", "Tej smiles", "Bigvernie", "TK-CP", "NovaSkola", "Polaron", "SluggoOne", "TeleComNasSprVen", "TCNSV", "Wayne Slam", "Someone65", "S.V.Taylor"];

if(twinkleBlacklistedUsers.indexOf(wgUserName) != -1 && twinkleConfigExists) twinkleConfigExists = false;

// let master load script know that this module has loaded
morebits_js_loaded = true;

// When Twinkle modules are imported, we can't be sure that this base module
// has been loaded yet. For that reason, modules using them need
// to initialize themselves using
//   window.TwinkleInit = (window.TwinkleInit || []).concat( someInitializationFunction );
// for maximal robustness. Looks weird, works well.
function twinkleInit() {
	var funcs = window.TwinkleInit;
	window.TwinkleInit = { concat : function(func){ func(); return window.TwinkleInit;} }; //redefine the concat method used to enqueue initializers: From now on, they just execute immediately.
	if (funcs) for (var i=0; i<funcs.length; i++) funcs[i]();
}

// Initialize when all main page elements have been loaded, but don't wait for images
$(document).ready(twinkleInit);

} //if (typeof(_morebits_loading) == 'undefined')
