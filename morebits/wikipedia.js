// Accessor functions for wikiediting and api-access
Wikipedia = {};

// we dump all XHR here so they won't loose props
Wikipedia.dump = [];

Wikipedia.numberOfActionsLeft = 0;
Wikipedia.nbrOfCheckpointsLeft = 0;

/* Use of Wikipedia.actionCompleted():
 *    Every call to Wikipedia.api.post() results in the dispatch of
 *    an asynchronous callback. Each callback can in turn
 *    make an additional call to Wikipedia.api.post() to continue a 
 *    processing sequence. At the conclusion of the final callback
 *    of a processing sequence, it is not possible to simply return to the
 *    original caller because there is no call stack leading back to
 *    the original context. Instead, Wikipedia.actionCompleted.event() is
 *    called to display the result to the user and to perform an optional
 *    page redirect.
 *
 *    The determination of when to call Wikipedia.actionCompleted.event()
 *    is managed through the globals Wikipedia.numberOfActionsLeft and
 *    Wikipedia.nbrOfCheckpointsLeft. Wikipedia.numberOfActionsLeft is
 *    incremented at the start of every Wikipedia.api call and decremented 
 *    after the completion of a callback function. If a callback function
 *    does not create a new Wikipedia.api object before exiting, it is the
 *    final step in the processing chain and Wikipedia.actionCompleted.event()
 *    will then be called.
 *
 *    Optionally, callers may use Wikipedia.addCheckpoint() to indicate that
 *    processing is not complete upon the conclusion of the final callback function.
 *    This is used for batch operations. The end of a batch is signaled by calling
 *    Wikipedia.removeCheckpoint(). 
 */
 
Wikipedia.actionCompleted = function( self ) {
	if( --Wikipedia.numberOfActionsLeft <= 0 && Wikipedia.nbrOfCheckpointsLeft <= 0 ) {
		Wikipedia.actionCompleted.event( self );
	}
}

// Change per action wanted
Wikipedia.actionCompleted.event = function() {
	new Status( Wikipedia.actionCompleted.notice, Wikipedia.actionCompleted.postfix, 'info' );
	if( Wikipedia.actionCompleted.redirect != null ) {
		// if it isn't an url, make it an relative to self (probably this is the case)
		if( !/^\w+\:\/\//.test( Wikipedia.actionCompleted.redirect ) ) {
			Wikipedia.actionCompleted.redirect = wgServer + wgArticlePath.replace( '$1', encodeURIComponent( Wikipedia.actionCompleted.redirect ).replace( /\%2F/g, '/' ) );
			if( Wikipedia.actionCompleted.followRedirect === false ) Wikipedia.actionCompleted.redirect += "?redirect=no";
		}
		window.setTimeout( function() { window.location = Wikipedia.actionCompleted.redirect } , Wikipedia.actionCompleted.timeOut );
	}
}
wpActionCompletedTimeOut = typeof(wpActionCompletedTimeOut) == 'undefined'  ? 5000 : wpActionCompletedTimeOut;
wpMaxLag = typeof(wpMaxLag) == 'undefined' ? 10 : wpMaxLag; // Maximum lag allowed, 5-10 is a good value, the higher value, the more agressive.

Wikipedia.editCount = 10;
Wikipedia.actionCompleted.timeOut = wpActionCompletedTimeOut;
Wikipedia.actionCompleted.redirect = null;
Wikipedia.actionCompleted.notice = 'Action';
Wikipedia.actionCompleted.postfix = 'completed';

Wikipedia.addCheckpoint = function() {
	++Wikipedia.nbrOfCheckpointsLeft;
}

Wikipedia.removeCheckpoint = function() {
	if( --Wikipedia.nbrOfCheckpointsLeft <= 0 && Wikipedia.numberOfActionsLeft <= 0 ) {
		Wikipedia.actionCompleted.event();
	}
}

/*
 currentAction: text, the current action (required)
 query: Object, the query (required)
 onSuccess: function, the function to call when page gotten
 onError: function, the function to call if an error occurs
 */
Wikipedia.api = function( currentAction, query, onSuccess, statusElement, onError ) {
	this.currentAction = currentAction;
	this.query = query;
	this.query['format'] = 'xml';
	this.onSuccess = onSuccess;
	this.onError = onError;
	if( statusElement ) {
		this.statelem = statusElement;
		this.statelem.status( currentAction );
	} else {
		this.statelem = new Status( currentAction );
	}
}
Wikipedia.api.prototype = {
	currentAction: '',
	onSuccess: null,
	onError: null,
	query: null,
	responseXML: null,
	statelem: null,  // this non-standard name kept for backwards compatibility
	post: function() {	
		++Wikipedia.numberOfActionsLeft;
		$.ajax( {
			context: this,
			type: 'POST',
			url: wgServer + wgScriptPath + '/api.php', 
			data: QueryString.create(this.query),
			dataType: 'xml',
			success: function(xml, textStatus, jqXHR) {
				this.textStatus = textStatus;
				this.responseXML = xml;
				
				if (this.onSuccess) this.onSuccess(this);
				else this.statelem.info(textStatus);
				
				Wikipedia.actionCompleted();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				this.textStatus = textStatus;
				this.errorThrown = errorThrown;
				
				if (this.onError) this.onError(this)
				else this.statelem.error(textStatus + ': ' + errorThrown + ' occurred while querying the API.');
				
				// leave the pop-up window open so that the user sees the error
			}
		} );
	},
	
	getStatusElement: function() { return this.statelem; }
}

/** 
 * Class: Wikipedia.page
 * Uses the MediaWiki API to load a page and optionally edit it.
 *
 * Callers are not permitted to directly access the properties of this class!
 * All property access is through the appropriate getProperty() or setProperty() method.
 *
 * Callers should set Wikipedia.actionCompleted.notice and Wikipedia.actionCompleted.redirect
 * before the first call to Wikipedia.page.load().
 *
 * Each of the callback functions takes one parameter, which is a
 * reference to the Wikipedia.page object that registered the callback.
 * Callback functions may invoke any Wikipedia.page prototype method using this reference.
 *
 * Constructor: Wikipedia.page(pageName, currentAction)
 *    pageName - the name of the page, prefixed by the namespace (if any)
 *               (for the current page, use wgPageName)
 *    currentAction - a string describing the action about to be undertaken (optional)
 *
 * load(onSuccess, onFailure): Loads the text for the page
 *    onSuccess - callback function which is called when the load has succeeded
 *    onFailure - callback function which is called when the load fails (optional)
 *                *** onFailure for load() is not yet implemented – do we need it? ***
 *
 * save(onSuccess, onFailure): Saves the text for the page. Must be preceded by calling load().
 *    onSuccess - callback function which is called when the save has succeeded (optional)
 *    onFailure - callback function which is called when the save fails (optional)
 *    Warning: Calling save() can result in additional calls to the previous load() callbacks to
 *             recover from edit conflicts! 
 *             In this case, callers must make the same edit to the new pageText and reinvoke save(). 
 *             This behavior can be disabled with setMaxConflictRetries(0).
 *
 * append(onSuccess, onFailure): Adds the text provided via setAppendText() to the end of the page.
 *                               Does not require calling load() first.
 *    onSuccess - callback function which is called when the method has succeeded (optional)
 *    onFailure - callback function which is called when the method fails (optional)
 *
 * prepend(onSuccess, onFailure): Adds the text provided via setPrependText() to the start of the page.
 *                                Does not require calling load() first.
 *    onSuccess - callback function which is called when the method has succeeded (optional)
 *    onFailure - callback function which is called when the method fails (optional)
 *
 * getPageName(): returns a string containing the name of the loaded page, including the namespace
 *
 * getPageText(): returns a string containing the text of the page after a successful load()
 *
 * setPageText(pageText) 
 *    pageText - string containing the updated page text that will be saved when save() is called
 *
 * setAppendText(appendText) 
 *    appendText - string containing the text that will be appended to the page when append() is called
 *
 * setPrependText(prependText) 
 *    prependText - string containing the text that will be prepended to the page when prepend() is called
 *
 * setEditSummary(summary)
 *    summary - string containing the text of the edit summary that will be used when save() is called
 *
 * setMinorEdit(minorEdit) 
 *    minorEdit is a boolean value:
 *       true  - When save is called, the resulting edit will be marked as "minor".
 *       false - When save is called, the resulting edit will not be marked as "minor". (default)
 *
 * setMaxConflictRetries(maxRetries)
 *    maxRetries - number of retries for save errors involving an edit conflict or loss of edit token
 *    default: 2
 *
 * setMaxRetries(maxRetries)
 *    maxRetries - number of retries for save errors not involving an edit conflict or loss of edit token
 *    default: 2
 *
 * setCallbackParameters(callbackParameters)
 *    callbackParameters - an object for use in a callback function
 *
 * getCallbackParameters(): returns the object previous set by setCallbackParameters()
 *
 *    Callback notes: callbackParameters is for use by the caller only. The parameters
 *                    allow a caller to pass the proper context into its callback function.
 *                    Callers must ensure that any changes to the callbackParameters object
 *                    within a load() callback still permit a proper re-entry into the
 *                    load() callback if an edit conflict is detected upon calling save().
 *
 * getStatusElement(): returns the Status element created by the constructor
 *
 * setFollowRedirect(followRedirect)
 *    followRedirect is a boolean value:
 *       true  - a maximum of one redirect will be followed.
 *               In the event of a redirect, a message is displayed to the user and 
 *               the redirect target can be retrieved with getPageName().
 *       false - the requested pageName will be used without regard to any redirect. (default)
 *
 * setWatchlist(watchlistOption)
 *    watchlistOption is a boolean value:
 *       true  - page will be added to the user's watchlist when save() is called
 *       false - watchlist status of the page will not be changed (default)
 *
 * setWatchlistFromPreferences(watchlistOption)
 *    watchlistOption is a boolean value:
 *       true  - page watchlist status will be set based on the user's 
 *               preference settings when save() is called
 *       false - watchlist status of the page will not be changed (default)
 *
 *    Watchlist notes:
 *       1. The MediaWiki API value of 'unwatch' isn't used here because it seems to behave
 *          the same as 'nochange'. Not sure why we would want this option anyway.
 *       2. If both setWatchlist() and setWatchlistFromPreferences() are called,
 *          the last call takes priority.
 *       3. Twinkle modules should use the appropriate TwinkleConfig parameter to set the watchlist options.
 *       4. Most Twinkle modules use setWatchlist().
 *          setWatchlistFromPreferences() is only used for the few TwinkleConfig watchlist parameters
 *          that accept a string value of 'default'.
 *
 * setCreateOption(createOption)
 *    createOption is a string value:
 *       'recreate'   - create the page if it does not exist, or edit it if it exists
 *       'createonly' - create the page if it does not exist, but return an error if it
 *                      already exists
 *       'nocreate'   - don't create the page, only edit it if it already exists
 *       other/null   - create the page if it does not exist, unless it was deleted in the moment
 *                      between retrieving the edit token and saving the edit
 */

// Class constructor
Wikipedia.page = function(pageName, currentAction) {
	this.pageName = pageName;
	if (currentAction == null) currentAction = 'Opening page: ' + pageName;
	this.statusElement = new Status(currentAction);
}

/**
 * Call sequence for common operations (optional final user callbacks not shown):
 *
 *    Edit current contents of a page (no edit conflict):
 *       .load() -> Wikipedia.api.post() -> .callbacks.loadSuccess() -> userTextEditCallback() -> 
 *                  .save() -> Wikipedia.api.post() -> .callbacks.saveSuccess()
 *
 *    Edit current contents of a page (with edit conflict):
 *       .load() -> Wikipedia.api.post() -> .callbacks.loadSuccess() -> userTextEditCallback() -> 
 *                  .save() -> Wikipedia.api.post() -> .callbacks.saveFailure() ->
 *       .load() -> Wikipedia.api.post() -> .callbacks.loadSuccess() -> userTextEditCallback() -> 
 *                  .save() -> Wikipedia.api.post() -> .callbacks.saveSuccess()
 *
 *    Append to a page (similar for prepend):
 *       .append() -> .load() -> Wikipedia.api.post() -> 
 *                    .callbacks.loadSuccess() -> .callbacks.autoSave() ->
 *                    .save() -> Wikipedia.api.post() -> .callbacks.saveSuccess()
 *
 *    Notes: 
 *       1. All functions following Wikipedia.api.post() are invoked asynchronously 
 *          from the jQuery AJAX library.
 *       2. In the case of .edit(), .callbacks.loadSuccess() performs one re-entry into .load() 
 *          when following a redirect. 
 *       3. In the case of .append() or .prepend(), .callbacks.loadSuccess() performs two re-entries  
 *          into .load() when following a redirect. The first re-entry is to retrieve the 
 *          redirect target and the second is to verify that the target is not itself a redirect.
 *       4. Edit conflicts do not result in additional re-entries due to redirects because the
 *          resolved page name is retained from the first edit attempt.
 *       5. The sequence for append/prepend could be slightly shortened, but it would require
 *          significant duplication of code for little benefit.
 */
 
Wikipedia.page.prototype = {
	pageName: null,
	statusElement: null,
	pageLoaded: false,
	followRedirect: false,
	maxRetries: 2,
	maxConflictRetries: 2,
	conflictRetries: 0,
	retries: 0,
	editSummary: null,
	watchlistOption: 'nochange',
	createOption: null,
	onLoadSuccess: null,
	onLoadFailure: null,
	onSaveSuccess: null,
	onSaveFailure: null,
	loadQuery: null,
	loadApi: null,
	saveApi: null,
	pageText: null,
	appendText: null,   // can't reuse pageText for this because pageText is needed to follow a redirect
	prependText: null,  // can't reuse pageText for this because pageText is needed to follow a redirect
	editToken: null,
	loadTime: null,
	lastEditTime: null,
	minorEdit: false,
	editMode: 'all',  // save() replaces entire contents of the page
	callbackParameters: null,
	
	getPageName: function() { return this.pageName; },
	getPageText: function() { return this.pageText; },
	setPageText: function(pageText) { this.editMode = 'all'; this.pageText = pageText; },
	setAppendText: function(appendText) { this.editMode = 'append'; this.appendText = appendText; },
	setPrependText: function(prependText) { this.editMode = 'prepend'; this.prependText = prependText; },
	setEditSummary: function(summary) { this.editSummary = summary; },
	setCreateOption: function(createOption) { this.createOption = createOption; },
	setMinorEdit: function(minorEdit) { this.minorEdit = minorEdit; },
	setMaxConflictRetries: function(maxRetries) { this.maxConflictRetries = maxRetries; },
	setMaxRetries: function(maxRetries) { this.maxRetries = maxRetries; },
	setCallbackParameters: function(callbackParameters) { this.callbackParameters = callbackParameters; },
	getCallbackParameters: function() { return this.callbackParameters; },
	getStatusElement: function() { return this.statusElement; },
	
	setFollowRedirect: function(followRedirect) {
		if (this.pageLoaded) {
			this.statusElement.error("Internal error: Cannot change redirect setting after the page has been loaded!");
			return;
		}
		this.followRedirect = followRedirect;
	},
	
	setWatchlist: function(flag) {
		if (flag) this.watchlistOption = 'watch';
		else this.watchlistOption = 'nochange';
	},
	
	setWatchlistFromPreferences: function(flag) {
		if (flag) this.watchlistOption = 'preferences';
		else this.watchlistOption = 'nochange';
	},
	
	load: function(onSuccess, onFailure) {
		this.onLoadSuccess = onSuccess;
		this.onLoadFailure = onFailure;
		
		// Need to be able to do something after the page loads
		if (onSuccess == null) {
			this.statusElement.error("Internal error: No onSuccess callback provided to load()!");
			return;
		}

		this.loadQuery = {
			action: 'query',
			prop: 'info|revisions',
			intoken: 'edit',  // fetch an edit token
			titles: this.pageName
			// don't need rvlimit=1 because we don't need rvstartid here and only one actual rev is returned by default
		};
		
		if (this.editMode == 'all') this.loadQuery.rvprop = 'content';  // get the page content at the same time, if needed
		
		this.loadApi = new Wikipedia.api("Retrieving page...", this.loadQuery, Wikipedia.page.callbacks.loadSuccess, this.statusElement);
		this.loadApi.parent = this;
		this.loadApi.post();
	},

	// Save updated .pageText to Wikipedia
	// Only valid after successful .load()
	save: function(onSuccess, onFailure) {
		if (!this.pageLoaded)
		{
			this.statusElement.error("Internal error: Attempt to save a page that has not been loaded!");
			return;
		}
		if (!this.editSummary)
		{
			this.statusElement.error("Internal error: Edit summary not set before save!");
			return;
		}
		this.onSaveSuccess = onSuccess;
		this.onSaveFailure = onFailure;
		this.retries = 0;
		
		var query = {
			action: 'edit',
			title: this.pageName,
			summary: this.editSummary,
			token: this.editToken,
			watchlist: this.watchlistOption,
			minor: this.minorEdit,
			notminor: !this.minorEdit  // force Twinkle config to override user preference setting for "all edits are minor"
		};
		
		switch (this.editMode) {
			case 'append':
				query.appendtext = this.appendText;  // use mode to append to current page contents
				break;
			case 'prepend':
				query.prependtext = this.prependText;  // use mode to preprend to current page contents
				break;
			default:
				query.text = this.pageText; // replace entire contents of the page
				query.basetimestamp = this.lastEditTime; // check that page hasn't been edited since it was loaded
				query.starttimestamp = this.loadTime; // check that page hasn't been deleted since it was loaded (don't recreate bad stuff)
				break;
		}

		if (['recreate', 'createonly', 'nocreate'].indexOf(this.createOption) != -1) {
			query[this.createOption] = '';
		}

		this.saveApi = new Wikipedia.api( "Saving page...", query, Wikipedia.page.callbacks.saveSuccess, this.statusElement, Wikipedia.page.callbacks.saveError);
		this.saveApi.parent = this;
		this.saveApi.post();
	},
	
	append: function(onSuccess, onFailure) {
		this.editMode = 'append';
		this.onSaveSuccess = onSuccess;
		this.onSaveFailure = onFailure;
		this.load(Wikipedia.page.callbacks.autoSave, onFailure);
	},

	prepend: function(onSuccess, onFailure) {
		this.editMode = 'prepend';
		this.onSaveSuccess = onSuccess;
		this.onSaveFailure = onFailure;
		this.load(Wikipedia.page.callbacks.autoSave, onFailure);
	},
}

Wikipedia.page.callbacks = {
	loadSuccess: function(apiObject) {  // callback from loadApi.post()
		var self = apiObject.parent;  // retrieve reference to "this" object
		var xml = apiObject.responseXML;

		self.pageText = $(xml).find('rev').text();
		if (this.editMode == 'all' && !self.pageText)
		{
			self.statusElement.error("Failed to retrieve page text.");
			return;
		}

		// check to see if the page is a redirect and follow it if requested
		if (self.followRedirect)
		{
			var isRedirect = $(xml).find('pages').find('page').attr('redirect');
			if (isRedirect)
			{
				var redirmatch = /\[\[(.*)\]\]/.exec(self.pageText);
				if (redirmatch)
				{
					self.pageName = redirmatch[1];
					self.followRedirect = false;  // no double redirects!
					
					// load the redirect page instead
					self.loadQuery['titles'] = self.pageName;
					self.loadApi = new Wikipedia.api("Following redirect...", self.loadQuery, Wikipedia.page.callbacks.loadSuccess, self.statusElement);
					self.loadApi.parent = self;
					self.loadApi.post();
					return;
				}
			}
		}

		self.editToken = $(xml).find('page').attr('edittoken');
		if (!self.editToken)
		{
			self.statusElement.error("Failed to retrieve edit token.");
			return;
		}
		self.loadTime = $(xml).find('page').attr('starttimestamp');
		if (!self.loadTime)
		{
			self.statusElement.error("Failed to retrieve start timestamp.");
			return;
		}
		self.lastEditTime = $(xml).find('page').attr('touched');
		if (!self.lastEditTime)
		{
			self.statusElement.error("Failed to retrieve last edit time.");
			return;
		}
		self.pageLoaded = true;
		self.onLoadSuccess(self);  // invoke callback
	},
	
	autoSave: function(self) {  // callback from loadSuccess(), append() and prepend()
		self.save(self.onSaveSuccess, self.onSaveFailure);
	},
	
	saveSuccess: function(apiObject) {  // callback from saveApi.post()
		var self = apiObject.parent;  // retrieve reference to "this" object
		self.editMode = 'all';  // cancel append/prepend modes

		if (self.onSaveSuccess) self.onSaveSuccess(self);  // invoke callback
		else self.statusElement.info('Completed save of: ' + self.pageName);
	},
	
	saveError: function(apiObject) {  // callback from saveApi.post()
		var self = apiObject.parent;  // retrieve reference to "this" object

		// XXX Need to explicitly detect edit conflict and loss of edittoken conditions here
		// It's impractical to request a new token, just invoke the edit conflict recovery logic when this happens
		var loadAgain = true;  // XXX do something smart here using apiObject.errorThrown
		
		if (loadAgain && self.conflictRetries++ < self.maxConflictRetries) {
			self.statusElement.info("Edit conflict detected, attempting retry...");
			Wikipedia.page.load(self.onLoadSuccess, self.onLoadFailure);
			
		// Unknown POST error, retry the operation
		} else if (self.retries++ < self.maxRetries) {
			self.statusElement.info("Save failed, attempting retry...");
			self.saveApi.post();  // give it another go!

		} else {
			self.statusElement.error("Failed to save edit to: " + self.pageName + ", because of: " + result);
			self.editMode = 'all';  // cancel append/prepend modes
			if (self.onSaveFailure) self.onSaveFailure(self);  // invoke callback
		}
	}
}

/* Issues:
	- Do we need the onFailure callbacks? How do we know when to call them? Timeouts? Enhance Wikipedia.api for failures?
	- Should we retry loads also?
	- Need to reset current action before the save?
	- Deal with action.completed stuff
*/


/************* The following three functions are from the old Wikipedia.page 
               and haven't yet been converted to the new format *******************/
			   
			   
/** 
 * Wikipedia.page.revert
 * Uses the MediaWiki API to revert a page to an earlier revision.
 *
 * About the callback functions:
 *  See Wikipedia.page.edit documentation above.
 *
 * Parameters:
 *  currentAction - the name of the action performed by the edit (e.g. "Reverting given revision")
 *  title - the title of the page to edit (for the current page, use wgPageName)
 *  oldid - the revision ID to revert to
 *  editSummary - the edit summary to use (or |undefined| if the default summary should be used -- ??? maybe this works)
 *  onsuccess - a callback function which is called when the revert has succeeded (optional)
 *  onFailure - a callback function which is called when the revert fails (optional, and rarely 
 *              needed - the built-in error handling should typically be enough)
 */
wikiRevert = function(currentAction, title, oldid, summary, onsuccess, onfailure)
{
	var query = {
		'action': 'query',
		'prop': 'info|revisions',
		'intoken': 'edit', // fetch an edit token
		'titles': title
	};
	var statelem = new Status(currentAction);
	var wikipedia_api = new Wikipedia.api("Retrieving revert data...", query, Wikipedia.page.callbacks.revert.request, statelem);
	wikipedia_api.params = params;
	wikipedia_api.title = title;
	wikipedia_api.oldid = oldid;
	wikipedia_api.summary = summary;
	wikipedia_api.onsuccess = (onsuccess ? onsuccess : function(self) { self.statelem.info("Done") });
	wikipedia_api.onfailure = onfailure;
	wikipedia_api.post();
}

/** 
 * Wikipedia.page.notifyInitialContributor
 * Uses the MediaWiki API to edit the talk page of the initial contributor to a page.
 *
 * About the callback functions:
 *  See Wikipedia.page.edit documentation above.
 *
 * Parameters:
 *  title - the title of the page whose first contributor should be looked up
 *          (for the current page, use wgPageName)
 *  params - parameters to be passed onto the callback functions (as self.params)
 *  onedit - a callback function which modifies the page text as required, and returns
 *           either a) a JSON object with the API query parameters (other than 'action',
 *           'title', and 'token', which are automatically appended), or b) |false| to
 *           indicate that the edit should not proceed
 *  onsuccess - a callback function which is called when the edit has succeeded (optional)
 *  onfailure - a callback function which is called when the edit fails (optional, and rarely 
 *              needed - the built-in error handling should typically be enough)
 *
 * The currentAction is hardcoded to "Notifying initial contributor (<their username>)", and
 * followRedirect is always true.
 */
wikiNotifyInitialContributor = function(title, params, onedit, onsuccess, onfailure)
{
	var query = {
		'action': 'query',
		'prop': 'revisions',
		'titles': title,
		'rvlimit': 1,
		'rvprop': 'user',
		'rvdir': 'newer'
	}
	var callback = function (self)
	{
		var xmlDoc = self.responseXML;
		self.username = xmlDoc.evaluate('//rev/@user', xmlDoc, null, XPathResult.STRING_TYPE, null).stringValue;
		Wikipedia.editPage("Notifying initial contributor (" + self.username + ")", "User talk:" + self.username, self.params,
			self.onedit, self.onsuccess, self.onfailure, true); // last param: always follow redirects in user talk space
	};
	var wikipedia_api = new Wikipedia.api("Retrieving page creator information", query, callback);
	wikipedia_api.title = title;
	wikipedia_api.params = params;
	wikipedia_api.onedit = onedit;
	wikipedia_api.onsuccess = onsuccess;
	wikipedia_api.onfailure = onfailure;
	wikipedia_api.post();
}

// Don't call this function. It's a callback.
wikiRevertCallback = function(self) {
	var xmlDoc = self.responseXML;
	var revid = xmlDoc.evaluate('//rev/@revid', xmlDoc, null, XPathResult.STRING_TYPE, null).stringValue;
	var edittoken = self.responseXML.evaluate('//page/@edittoken', self.responseXML, null, XPathResult.STRING_TYPE, null).stringValue;
	if (!edittoken)
	{
		self.statelem.error("Failed to retrieve edit token.");
		return;
	}
	var basetimestamp = xmlDoc.evaluate('//page/@touched', xmlDoc, null, XPathResult.STRING_TYPE, null).stringValue;
	
	var query = {
		'action': 'edit',
		'title': self.title,
		'token': edittoken,
		'basetimestamp': basetimestamp, // prevent (most...) edit conflicts
		'summary': self.summary,
		'undo': oldid,
		'undoafter': revid
	};
	var wikipedia_api = new Wikipedia.api("Sending revert data...", result, Wikipedia.page.callbacks.edit.success, self.statelem);
	wikipedia_api.params = self.params;
	wikipedia_api.title = self.title;
	wikipedia_api.post();
}

/*
 currentAction: text, the current action (required)
 query: Object, the query (required)
 oninit: function, the function to call when page gotten (required)
 onsuccess: function, a function to call when post succeeded
 onerror: function, a function to call when we abort failed posts
 onretry: function, a function to call when we try to retry a post
 */
Wikipedia.wiki = function( currentAction, query, oninit, onsuccess, onerror, onretry ) {

	alert('The action "' + currentAction + '" is still using the "Wikipedia.wiki" class.'); // for code testers only - normal editors won't need this alert

	this.currentAction = currentAction;
	this.query = query;
	this.oninit = oninit;
	this.onsuccess = onsuccess;
	this.onerror = onerror;
	this.onretry = onretry;
	this.statelem = new Status( currentAction );
	++Wikipedia.numberOfActionsLeft;
}

Wikipedia.wiki.prototype = {
	currentAction: '',
	onsuccess: null,
	onerror: null,
	onretry: null,
	oninit: null,
	query: null,
	postData: null,
	responseXML: null,
	statelem: null,
	counter: 0,
	post: function( data ) {
		this.postData = data;
		if( Wikipedia.editCount <= 0 ) {
			this.query['maxlag'] = wpMaxLag; // are we a bot?
		} else {
			--Wikipedia.editCount;
		}

		var xmlhttp = sajax_init_object();
		Wikipedia.dump.push( xmlhttp );
		xmlhttp.obj = this;
		xmlhttp.overrideMimeType('text/xml');
		xmlhttp.open( 'POST' , wgServer + wgScriptPath + '/index.php?useskin=monobook&' + QueryString.create( this.query ), true);
		xmlhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		xmlhttp.onerror = function(e) {
			var self = this.obj;
			self.statelem.error( "Error " + this.status + " occurred while posting the document." );
		}
		xmlhttp.onload = function(e) {
			var self = this.obj;
			var status = this.status;
			if( status != 200 ) {
				if( status == 503 ) {
					var retry = this.getResponseHeader( 'Retry-After' );
					var lag = this.getResponseHeader( 'X-Database-Lag' );
					if( lag ) {
						self.statelem.warn( "current lag of " + lag + " seconds is more than our defined maximum lag of " + wpMaxLag + " seconds, will retry in " + retry + " seconds" );
						window.setTimeout( function( self ) { self.post( self.postData ); }, retry * 1000, self );
						return;
					} else {
						self.statelem.error( "Error " + status + " occurred while posting the document." );
					}
				}
				return;
			}
			var xmlDoc;
			xmlDoc = self.responseXML = this.responseXML;
			var xpathExpr =  'boolean(//div[@class=\'previewnote\']/p/strong[contains(.,\'Sorry! We could not process your edit due to a loss of session data\')])';
			var nosession = xmlDoc.evaluate( xpathExpr, xmlDoc, null, XPathResult.BOOLEAN_TYPE, null ).booleanValue;
			if( nosession ) {
				// Grabbing the shipping token, and repost
				var new_token = xmlDoc.evaluate( '//input[@name="wfEditToken"]/@value', xmlDoc, null, XPathResult.STRING_TYPE, null ).stringValue;
				self.postData['wfEditToken'] = new_token;
				self.post( self.postData );
			} else {
				if( self.onsuccess ) {
					self.onsuccess( self );
				} else {
					var link = document.createElement( 'a' );
					link.setAttribute( 'href', wgArticlePath.replace( '$1', self.query['title'] ) );
					link.setAttribute( 'title', self.query['title'] );
					link.appendChild( document.createTextNode( self.query['title'] ) );

					self.statelem.info( [ 'completed (' , link , ')' ] );
				}
				Wikipedia.actionCompleted();
			}
		};
		xmlhttp.send( QueryString.create( this.postData ) );
	},
	get: function() {
		this.onloading( this );
		var redirect_query = {
			'action': 'query',
			'titles': this.query['title'],
			'redirects': ''
		}

		var wikipedia_api = new Wikipedia.api( "resolving eventual redirect", redirect_query, this.postget, this.statelem );
		wikipedia_api.parent = this;
		wikipedia_api.post();
	},
	postget: function() {
		var xmlDoc = self.responseXML = this.responseXML;
		var to = xmlDoc.evaluate( '//redirects/r/@to', xmlDoc, null, XPathResult.STRING_TYPE, null ).stringValue;
		if( !this.parent.followRedirect ) {
			this.parent.statelem.info('ignoring eventual redirect');
		} else if( to ) {
			this.parent.query['title'] = to;
		}
		this.parent.onloading( this );
		var xmlhttp = sajax_init_object();
		Wikipedia.dump.push( xmlhttp );
		xmlhttp.obj = this.parent;
		xmlhttp.overrideMimeType('text/xml');
		xmlhttp.open( 'GET' , wgServer + wgScriptPath + '/index.php?useskin=monobook&' + QueryString.create( this.parent.query ), true);
		xmlhttp.onerror = function() {
			var self = this.obj;
			self.statelem.error( "Error " + this.status + " occurred while receiving the document." );
		}
		xmlhttp.onload = function() { 
			this.obj.onloaded( this.obj );
			this.obj.responseXML = this.responseXML;
			this.obj.responseText = this.responseText;
			this.obj.oninit( this.obj ); 
		};
		xmlhttp.send( null );
	},
	onloading: function() {
		this.statelem.status( 'loading data...' );
	},
	onloaded: function() {
		this.statelem.status( 'data loaded...' );
	}
}


/**
 * These functions retrieve the date from the server. It uses bandwidth, time, etc.
 * They should be used only when the magic words { {subst:CURRENTDAY}},
 * { {subst:CURRENTMONTHNAME}}, and { {subst:CURRENTYEAR}} cannot be used
 * (for example, when specifying the title of a page).
 */
//WikiDate = {
//	currentLongDate: false,
	// Gets the server date in yyyy mmmm dd format (e.g. for XfD daily pages).
//	getLongDate: function wikiDateGetLongDate()
//	{
//		var query = {
//			'action': 'expandtemplates',
//			'text': '\{\{CURRENTYEAR}} \{\{CURRENTMONTHNAME}} \{\{CURRENTDAY}}'
//		};
//		var callback = function(self) 
//		{
			
//		};
//		var wpapi = new Wikipedia.api("Retrieving server date", query, callback);
		// AJAX is async, unfortunately; this stuff is not a nice solution
//		for (var i = 0; i < 20; i++)
			
//	}
//};

