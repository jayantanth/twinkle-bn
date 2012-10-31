/*
 ****************************************
 *** friendlytag.js: Tag module
 ****************************************
 * Mode of invocation:     Tab ("Tag")
 * Active on:              Existing articles; file pages with a corresponding file
 *                         which is local (not on Commons); existing user subpages
 *                         and existing subpages of Wikipedia:Articles for creation;
 *                         all redirects
 * Config directives in:   FriendlyConfig
 */
 
Twinkle.tag = function friendlytag() {
	// redirect tagging
	if( Wikipedia.isPageRedirect() ) {
		Twinkle.tag.mode = 'redirect';
		$(twAddPortletLink("#", "ট্যাগ", "friendly-tag", "ট্যাগ পুনর্নির্দেশনা", "")).click(Twinkle.tag.callback);
	}
	// file tagging
	else if( mw.config.get('wgNamespaceNumber') === 6 && !document.getElementById("mw-sharedupload") && document.getElementById("mw-imagepage-section-filehistory") ) {
		Twinkle.tag.mode = 'file';
		$(twAddPortletLink("#", "ট্যাগ", "friendly-tag", "ফাইলে রক্ষণাবেক্ষণ ট্যাগ যুক্ত করুন", "")).click(Twinkle.tag.callback);
	}
	// article tagging
	else if( mw.config.get('wgNamespaceNumber') === 0 && mw.config.get('wgCurRevisionId') ) {
		Twinkle.tag.mode = 'article';
		$(twAddPortletLink("#", "ট্যাগ", "friendly-tag", "নিবন্ধে রক্ষণাবেক্ষণ ট্যাগ যুক্ত করুন", "")).click(Twinkle.tag.callback);
	}
	// tagging of draft articles
	else if( ((mw.config.get('wgNamespaceNumber') === 2 && mw.config.get('wgPageName').indexOf("/") !== -1) || /^Wikipedia\:Articles[ _]for[ _]creation\//.exec(mw.config.get('wgPageName')) ) && mw.config.get('wgCurRevisionId') ) {
		Twinkle.tag.mode = 'draft';
		$(twAddPortletLink("#", "ট্যাগ", "friendly-tag", "পর্যাচোলনা ট্যাগ খসড়া নিবন্ধে  যুক্ত করুন", "")).click(Twinkle.tag.callback);
	}
};
 
Twinkle.tag.callback = function friendlytagCallback( uid ) {
	var Window = new SimpleWindow( 630, (Twinkle.tag.mode === "article") ? 450 : 400 );
	Window.setScriptName( "টুইংকল" );
	// anyone got a good policy/guideline/info page/instructional page link??
	Window.addFooterLink( "টুইংকল সাহায্য", "WP:TW/DOC#tag" );
 
	var form = new QuickForm( Twinkle.tag.callback.evaluate );
 
	switch( Twinkle.tag.mode ) {
		case 'article':
			Window.setTitle( "নিবন্ধ রক্ষণাবেক্ষণ ট্যাগিং" );
 
			form.append( {
					type: 'checkbox',
					list: [
						{
							label: 'যদি সম্ভব হয় {{বিবিধ সমস্যা}} দলে যুক্ত করুন',
							value: 'group',
							name: 'group',
							tooltip: 'যদি তিনটি বা তার বেশি ট্যাগ যুক্ত করতে চান তবে  {{বিবিধ সমস্যা}} দলে যুক্ত করুন ফাইল সকল ট্যাগ একই দলে যুক্ত হবে।',
							checked: Twinkle.getFriendlyPref('groupByDefault')
						}
					]
				}
			);
 
			form.append({
				type: 'select',
				name: 'sortorder',
				label: 'এই তালিকাটি দেখুন:',
				tooltip: 'আপনি যদি আপনার ডিফল্ট ট্যাগ ক্রম পরিবর্তন করতে চান, তা  আপনার টুইংকল পছন্দে (WP:TWPREFS) গিয়ে ঠিক করতে পারেন।',
				event: Twinkle.tag.updateSortOrder,
				list: [
					{ type: 'option', value: 'cat', label: 'বিষয়শ্রেণী বিন্যাস অনুসারে', selected: Twinkle.getFriendlyPref('tagArticleSortOrder') === 'cat' },
					{ type: 'option', value: 'alpha', label: ' বর্নানুক্রমিক  বিন্যাস', selected: Twinkle.getFriendlyPref('tagArticleSortOrder') === 'alpha' }
				]
			});
 
			form.append( { type: 'div', id: 'tagWorkArea' } );
 
			if( Twinkle.getFriendlyPref('customTagList').length ) {
				form.append( { type: 'header', label: 'পছন্দের ট্যাগ' } );
				form.append( { type: 'checkbox', name: 'articleTags', list: Twinkle.getFriendlyPref('customTagList') } );
			}
			break;
 
		case 'file':
			Window.setTitle( "ফাইল রক্ষণাবেক্ষণ ট্যাগিং" );
 
			// TODO: perhaps add custom tags TO list of checkboxes
 
			form.append({ type: 'header', label: 'লাইসেন্স ও উৎসের সমস্যার ট্যাগ' });
			form.append({ type: 'checkbox', name: 'imageTags', list: Twinkle.tag.file.licenseList } );
 
			form.append({ type: 'header', label: 'পরিস্করণ ট্যাগ' } );
			form.append({ type: 'checkbox', name: 'imageTags', list: Twinkle.tag.file.cleanupList } );
 
			form.append({ type: 'header', label: 'চিত্রের গুনাগুন বিচারের ট্যাগ' } );
			form.append({ type: 'checkbox', name: 'imageTags', list: Twinkle.tag.file.qualityList } );
 
			form.append({ type: 'header', label: 'উইকিমিডিয়া-কমন্স সম্পর্কিত ট্যাগ' });
			form.append({ type: 'checkbox', name: 'imageTags', list: Twinkle.tag.file.commonsList } );
 
			form.append({ type: 'header', label: 'প্রতিস্থাপন ট্যাগ' });
			form.append({ type: 'checkbox', name: 'imageTags', list: Twinkle.tag.file.replacementList } );
			break;
 
		case 'redirect':
			Window.setTitle( "Redirect tagging" );
 
			form.append({ type: 'header', label:'বানানা ভুল বা ব্যকরণ সমস্যা সম্পর্কিত টেমপ্লেট' });
			form.append({ type: 'checkbox', name: 'redirectTags', list: Twinkle.tag.spellingList });
 
			form.append({ type: 'header', label:'পর্যাক্রমিক নামের টেমপ্লেট' });
			form.append({ type: 'checkbox', name: 'redirectTags', list: Twinkle.tag.alternativeList });
 
			form.append({ type: 'header', label:'বিভিন্ন ও প্রশাসনিক পুর্ননির্দেশ টেমপ্লেট' });
			form.append({ type: 'checkbox', name: 'redirectTags', list: Twinkle.tag.administrativeList });
			break;
 
		case 'draft':
			Window.setTitle( "খসড়া নিবন্ধ  ট্যাগ" );
 
			form.append({ type: 'header', label:'খসড়া নিবন্ধ  ট্যাগ' });
			form.append({ type: 'checkbox', name: 'draftTags', list: Twinkle.tag.draftList });
			break;
 
		default:
			alert("Twinkle.tag: unknown mode " + Twinkle.tag.mode);
			break;
	}
 
	form.append( { type:'submit' } );
 
	var result = form.render();
	Window.setContent( result );
	Window.display();
 
	if (Twinkle.tag.mode === "article") {
		// fake a change event on the sort dropdown, to initialize the tag list
		var evt = document.createEvent("Event");
		evt.initEvent("change", true, true);
		result.sortorder.dispatchEvent(evt);
	}
};
 
Twinkle.tag.checkedTags = [];
 
Twinkle.tag.updateSortOrder = function(e) {
	var sortorder = e.target.value;
	var $workarea = $(e.target.form).find("div#tagWorkArea");
 
	Twinkle.tag.checkedTags = e.target.form.getChecked("articleTags");
	if (!Twinkle.tag.checkedTags) {
		Twinkle.tag.checkedTags = [];
	}
 
	// function to generate a checkbox, with appropriate subgroup if needed
	var makeCheckbox = function(tag, description) {
		var checkbox = { value: tag, label: "{{" + tag + "}}: " + description };
		if (Twinkle.tag.checkedTags.indexOf(tag) !== -1) {
			checkbox.checked = true;
		}
		if (tag === "globalize") {
			checkbox.subgroup = {
				name: 'globalize',
				type: 'select',
				list: [
					{ label: "{{বিশ্বব্যাপি}}: নিবন্ধটি বিষয়বস্তু ও উদাহরণ বিশ্বব্যাপি  ধারণকে উপস্থাপিত করেনি", value: "globalize" },
					{
						label: "{{বিশ্বব্যাপি}} টেমপ্লেটের  নির্দিষ্ট আঞ্চলিক  উপ-টেমপ্লেট ",
						list: [
					        { label: "{{বিশ্বব্যাপি/বাংলাদেশ}}: নিবন্ধে কেবলমাত্র  প্রাথমিকভাবে বাংলাদেশের দৃষ্টিভঙ্গি বা প্রক্ষাপট উপস্থাপিত হয়েছে", value: "globalize/Bangladesh" },
							{ label: "{{বিশ্বব্যাপি/ভারত}}: নিবন্ধে কেবলমাত্র  প্রাথমিকভাবে ভারতের  দৃষ্টিভঙ্গি বা প্রক্ষাপট উপস্থাপিত হয়েছে", value: "globalize/India" },
							{ label: "{{বিশ্বব্যাপি/পাশ্চাত্য}}: নিবন্ধে কেবলমাত্র  প্রাথমিকভাবে পাশ্চাত্যর  দৃষ্টিভঙ্গি বা প্রক্ষাপট উপস্থাপিত হয়েছে", value: "globalize/West" }
						]
					}
				]
			};
		} else if (tag === "notability") {
			checkbox.subgroup = {
				name: 'notability',
				type: 'select',
				list: [
					{ label: "{{উল্লেখযোগ্যতা}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই ", value: "none" },
					{ label: "{{উল্লেখযোগ্যতা|আকাডেমিক}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Academics" },
					{ label: "{{উল্লেখযোগ্যতা|জীবনী}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Biographies" },
					{ label: "{{উল্লেখযোগ্যতা|বই}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Books" },
					{ label: "{{উল্লেখযোগ্যতা|কোম্পানি}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Companies" },
					{ label: "{{উল্লেখযোগ্যতা|ঘটনা}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Events" },
					{ label: "{{উল্লেখযোগ্যতা|চলচ্চিত্র}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Films" },
					{ label: "{{উল্লেখযোগ্যতা|সঙ্গীত}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Music" },
					{ label: "{{উল্লেখযোগ্যতা|নবশব্দ}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Neologisms" },
					{ label: "{{উল্লেখযোগ্যতা|সংখ্যা}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Numbers" },
					{ label: "{{উল্লেখযোগ্যতা|পন্য}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Products" },
					{ label: "{{উল্লেখযোগ্যতা|খেলা}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Sport" },
					{ label: "{{উল্লেখযোগ্যতা|ওয়েব}}:নিবন্ধের বিষয়বস্তু উল্লেখযোগ্যতার সাধারণ নির্দেশাবলী অনুসরণ করে নাই", value: "Web" }
				]
			};
		}
		return checkbox;
	};
 
	// categorical sort order
	if (sortorder === "cat") {
		var div = new QuickForm.element({
			type: "div",
			id: "tagWorkArea"
		});
 
		// function to iterate through the tags and create a checkbox for each one
		var doCategoryCheckboxes = function(subdiv, array) {
			var checkboxes = [];
			$.each(array, function(k, tag) {
				var description = Twinkle.tag.article.tags[tag];
				checkboxes.push(makeCheckbox(tag, description));
			});
			subdiv.append({
				type: "checkbox",
				name: "articleTags",
				list: checkboxes
			});
		};
 
		var i = 0;
		// go through each category and sub-category and append lists of checkboxes
		$.each(Twinkle.tag.article.tagCategories, function(title, content) {
			div.append({ type: "header", id: "tagHeader" + i, label: title });
			var subdiv = div.append({ type: "div", id: "tagSubdiv" + i++ });
			if ($.isArray(content)) {
				doCategoryCheckboxes(subdiv, content);
			} else {
				$.each(content, function(subtitle, subcontent) {
					subdiv.append({ type: "div", label: [ htmlNode("b", subtitle) ] });
					doCategoryCheckboxes(subdiv, subcontent);
				});
			}
		});
 
		var rendered = div.render();
		$workarea.replaceWith(rendered);
		var $rendered = $(rendered);
		$rendered.find("h5").css({ 'font-size': '110%', 'margin-top': '1em' });
		$rendered.find("div").filter(":has(span.quickformDescription)").css({ 'margin-top': '0.4em' });
	}
	// alphabetical sort order
	else {
		var checkboxes = [];
		$.each(Twinkle.tag.article.tags, function(tag, description) {
			checkboxes.push(makeCheckbox(tag, description));
		});
		var tags = new QuickForm.element({
			type: "checkbox",
			name: "articleTags",
			list: checkboxes
		});
		$workarea.empty().append(tags.render());
	}
};
 
 
// Tags for ARTICLES start here
 
Twinkle.tag.article = {};
 
// A list of all article tags, in alphabetical order
// To ensure tags appear in the default "categorized" view, add them to the tagCategories hash below.
 
Twinkle.tag.article.tags = {
	"advert": "নিবন্ধটি বিজ্ঞাপনের মতো করে লেখা",
	"allplot": "নিবন্ধটি প্রায় পুরোটাই একটা দৃশ্যপট",
	"autobiography":"নিবন্ধটি একটি আত্মজীবনীমূলক এবং সম্ভবত নিরপেক্ষভাবে লিখিত নয়",
	"BLP sources":"জীবিত ব্যক্তির জীবনী যেখানে যাচাই করার জন্য অতিরিক্ত তথ্যসুত্র প্রয়োজন",
	"BLP unsourced": "জীবিত ব্যক্তির জীবনী যেখানে  কোনো তথ্যসূত্র উল্লেখিত হয়নি ",
	"cat improve": "নিবন্ধে অতিরিক্ত বিষয়শ্রেণী যোগ  করা প্রয়োজন",
	"citation style":"নিবন্ধে তথ্যসূত্র উদ্ধৃতিদান শৈলী ঠিক নেই", 
	"cleanup": "নিবন্ধটিকে পরিষ্কার করা প্রয়োজন।",
	"cleanup-reorganize":"নিবন্ধটিকে পরিষ্কার করে  উইকিপিডিয়ার রচনাশৈলী অনুযায়ী পুনঃবিন্যাস করা প্রয়োজন ",
	"close paraphrasing":"নিবন্ধটিতে অনেক কপিরাইট যুক্ত উক্তি দ্বারা লেখা হয়েছে।",
	"COI": "নিবন্ধটির সৃষ্টিকারি বা প্রধান অবদানকারির ব্যক্তিগত  স্বার্থের সহিত নিবন্ধের বিষয়বস্তু জড়িত।",
	"condense":"নিবন্ধটিতে  অনেক ছোট ছোট অনুচ্ছেদসহ সংক্ষিপ্ত  আকারে লেখা।",
	"confusing": "নিবন্ধটিতে  কিছু  বিভ্রান্তি আছে বা বিষয় পরিষ্কার নয়।",
	"context": "নিবন্ধটিতে  প্রসঙ্গ যাচাই করার জন্য  যথেষ্ট পরিমান তথ্য নেই।",
	"copy edit":"নিবন্ধটিতে প্রতিলিপি সম্পাদনা  কয়ার প্রয়োজন ।",
	"copypaste": "নিবন্ধটির উপাদান বা উপাত্ত  কোনো উৎস থেকে প্রতিলিপি  করে এখানে আনা হয়েছে।", 
	"dead end": "নিবন্ধটিতে অন্য নিবন্ধের সাথে কোনো লিঙ্ক নেই বা খুব কম আছে।",
	"disputed": "নিবন্ধটিতে তথ্য  বিতর্কিত বিষয়বস্তু আছে।",
	"essay-like": "নিবন্ধটি অনেকটা প্রবন্ধের মত করে লেখা হয়েছে।",
	"expert-subject": "নিবন্ধটিতে  এই বিষয় সম্পর্কে একজন বিশেষজ্ঞ  ব্যক্তির মনোনিবেশ প্রয়োজন।",
	"external links": "নিবন্ধটিতে অনেক বহিঃসংযোগ আছে যা উইকিপিডিয়ার রচনাশৈলী অনুযায়ী নয়।",
	"fansite": "নিবন্ধটি অনুরাগীসাইটের সঙ্গে মিলে যাচ্ছে।",
	"fiction": "নিবন্ধটি তথ্যপুর্ণ  না হয়ে একটি উপন্যাসের মত লেখা হছে।",
	"globalize": "নিবন্ধটি বিষয়বস্তু ও উদাহরণ বিশ্বব্যাপি  ধারণকে উপস্থাপিত করেনি",
	"hoax":"নিবন্ধটি  সম্পুর্ণ  ধোঁকাবাজি হতে পারে।",
	"incoherent": "অসংলগ্নarticle is incoherent or very hard to understand",
	"in use": "যবহার চলছেarticle is undergoing a major edit for a short while",
	"lead missing": "ভুমিকাহীনarticle has no lead section and one should be written",
	"lead rewrite": "ভুমিকা পুনর্লিখনarticle lead section needs to be rewritten to comply with guidelines",
	"lead too long": "নিবন্ধটিতে ভূমিকা অনুচ্ছেদটি অনেক বড় যা সংক্ষিপ্ত করা প্রয়োজন।",
	"lead too short": "নিবন্ধটিতে ভূমিকা অনুচ্ছেদটি খুব ছোট যা সম্প্রসারণ  করা প্রয়োজন।",
	"linkrot": "article uses bare URLs for references, which are prone to link rot",
	"merge": "article should be merged with another given article",
	"merge from": "another given article should be merged into this one",
	"merge to": "article should be merged into another given article",
	"metricate": "article exclusively uses non-SI units of measurement",
	"more footnotes": "article has some references, but insufficient in-text citations",
	"new unreviewed article": "mark article for later review",
	"no footnotes": "article has references, but no in-text citations",
	"non-free": "article may contain excessive or improper use of copyrighted materials",
	"notability": "article's subject may not meet the notability guideline",
	"not English": "article is written in a language other than English and needs translation",
	"one source": "article relies largely or entirely upon a single source",
	"original research": "article has original research or unverified claims",
	"orphan": "article is linked to from few or no other articles",
	"out of date": "article needs out-of-date information removed or updated",
	"overcoverage": "article has an extensive bias or disproportional coverage towards one or more specific regions",
	"overlinked": "article may have too many duplicate and/or irrelevant links",
	"over detailed": "article contains an excessive amount of intricate detail",
	"peacock": "article may contain peacock terms that promote the subject without adding information",
	"plot": "plot summary in article is too long",
	"POV": "article does not maintain a neutral point of view",
	"primary sources": "article relies too heavily on first-hand sources, and needs third-party sources",
	"prose": "article is in a list format that may be better presented using prose",
	"puffery": "article may contain wording that promotes the subject through exaggeration",
	"recentism": "article is slanted towards recent events",
	"ref improve": "article needs additional references or sources for verification",
	"rough translation": "নিবন্ধটি একটি খসড়া অনুবাদ যাকে পরিষ্কার করা প্রয়োজন।",
	"sections": "নিবন্ধটিকে অনুচ্ছেদে ভাগ করা উচিত।",
	"self-published": "article may contain improper references to self-published sources",
	"technical": "article may be too technical for the uninitiated reader",
	"tone": "tone of article is not appropriate",
	"too few opinions": "article may not include all significant viewpoints",
	"uncategorized": "article is uncategorized",
	"under construction": "article is currently in the middle of an expansion or major revamping",
	"unreferenced": "article has no references at all",
	"unreliable sources": "article's references may not be reliable sources",
	"update": "article needs additional up-to-date information added",
	"very long": "নিবন্ধটি আকারে অনেক বড়।",
	"weasel": "নিবন্ধটিতে কিছু অগ্রহনযোগ্য শব্দ আছে যা উইকিপিডিয়ার রচনাশৈলী মতে ঠিক নয়।",
	"wikify": "নিবন্ধটিকে উইকিপিডিয়ার রচনাশৈলী অনুযায়ী পুনঃবিন্যাস করা প্রয়োজন ",
};
 
// A list of tags in order of category
// Tags should be in alphabetical order within the categories
// Add new categories with discretion - the list is long enough as is!
 
Twinkle.tag.article.tagCategories = {
	"Cleanup and maintenance tags": {
		"General cleanup": [
			"cleanup",
			"copy edit",
			"wikify"
		],
		"Potentially unwanted content": [
			"close paraphrasing",
			"copypaste",
			"external links",
			"non-free",
			"NOT"
		],
		"Structure, formatting, and lead section": [
			"capitalization",
			"cleanup-reorganize",
			"condense",
			"lead missing",
			"lead rewrite",
			"lead too long",
			"lead too short",
			"sections",
			"very long"
		],
		"Fiction-related cleanup": [
			"allplot",
			"fiction",
			"in-universe",
			"plot"
		]
	},
	"General content issues": {
		"Importance and notability": [
			"notability"  // has subcategories and special-cased code
		],
		"Style of writing": [
			"advert",
			"essay-like",
			"fansite",
			"prose",
			"technical",
			"tense",
			"tone"
		],
		"Sense (or lack thereof)": [
			"confusing",
			"incoherent"
		],
		"Information and detail": [
			"context",
			"expert-subject",
			"metricate",
			"over detailed"
		],
		"Timeliness": [
			"out of date",
			"update"
		],
		"Neutrality, bias, and factual accuracy": [
			"autobiography",
			"COI",
			"disputed",
			"hoax",
			"globalize",  // has subcategories and special-cased code
			"peacock",
			"POV",
			"puffery",
			"recentism",
			"too few opinions",
			"weasel"
		],
		"Verifiability and sources": [
			"BLP sources",
			"BLP unsourced",
			"one source",
			"original research",
			"primary sources",
			"ref improve",
			"self-published",
			"unreferenced",
			"unreliable sources"
		]
	},
	"Specific content issues": {
		"Language": [
			"not English",
			"rough translation"
		],
		"Links": [
			"dead end",
			"orphan",
			"overlinked",
			"wikify"  // this tag is listed twice because it used to focus mainly on links, but now it's a more general cleanup tag
		],
		"Referencing technique": [
			"citation style",
			"linkrot",
			"more footnotes",
			"no footnotes"
		],
		"Categories": [
			"cat improve",
			"uncategorized"
		]
	},
	"Merging": [
		"merge",
		"merge from",
		"merge to"
	],
	"Informational": [
		"GOCEinuse",
		"in use",
		"new unreviewed article",
		"under construction"
	]
};
 
// Tags for REDIRECTS start here
 
Twinkle.tag.spellingList = [
	{
		label: '{{R from abbreviation}}: redirect from a title with an abbreviation',
		value: 'R from abbreviation' 
	},
	{
		label: '{{R to list entry}}: redirect to a \"list of minor entities\"-type article which contains brief descriptions of subjects not notable enough to have separate articles',
		value: 'R to list entry' 
	},
	{
		label: '{{R to section}}: similar to {{R to list entry}}, but when list is organized in sections, such as list of characters in a fictional universe.',
		value: 'R to section' 
	},
	{
		label: '{{R from misspelling}}: redirect from a misspelling or typographical error',
		value: 'R from misspelling' 
	},
	{
		label: '{{R from alternative spelling}}: redirect from a title with a different spelling',
		value: 'R from alternative spelling' 
	},
	{
		label: '{{R from plural}}: redirect from a plural word to the singular equivalent',
		value: 'R from plural' 
	},
	{
		label: '{{R from related word}}: redirect from a related word',
		value: 'R from related word' 
	},
	{
		label: '{{R with possibilities}}: redirect from a more specific title to a more general, less detailed article, hence something which can and should be expanded',
		value: 'R with possibilities' 
	},
	{
		label: '{{R from member}}: redirect from a member of a group to a related topic such as the group, organization, or team that he or she belongs to',
		value: 'R from member' 
	},
	{
		label: '{{R from other capitalisation}}: redirect from a title with another method of capitalisation',
		value: 'R from other capitalisation'
	}
];
 
Twinkle.tag.alternativeList = [
	{
		label: '{{R from alternative name}}: redirect from a title that is another name, a pseudonym, a nickname, or a synonym',
		value: 'R from alternative name' 
	},
	{
		label: '{{R from full name}}: redirect from a title that is a complete or more complete name',
		value: 'R from full name' 
	},
	{
		label: '{{R from surname}}: redirect from a title that is a surname',
		value: 'R from surname' 
	},
	{
		label: '{{R from historic name}}: redirect from another name with a significant historic past as a region, state, city or such, but which is no longer known by that title or name',
		value: 'R from historic name' 
	},
	{
		label: '{{R from scientific name}}: redirect from the scientific name to the common name',
		value: 'R from scientific name' 
	},
	{
		label: '{{R to scientific name}}: redirect from the common name to the scientific name',
		value: 'R to scientific name' 
	},
	{
		label: '{{R from name and country}}: redirect from the specific name to the briefer name',
		value: 'R from name and country' 
	},
	{
		label: '{{R from alternative language}}: redirect from an English name to a name in another language, or vice-versa',
		value: 'R from alternative language' 
	},
	{
		label: '{{R from ASCII}}: redirect from a title in basic ASCII to the formal article title, with differences that are not diacritical marks (accents, umlauts, etc.)',
		value: 'R from ASCII' 
	},
	{
		label: '{{R from title without diacritics}}: redirect to the article title with diacritical marks (accents, umlauts, etc.)',
		value: 'R from title without diacritics'
	}
];
 
Twinkle.tag.administrativeList = [
	{
		label: '{{R from merge}}: redirect from a merged page in order to preserve its edit history',
		value: 'R from merge' 
	},
	{
		label: '{{R to disambiguation page}}: redirect to a disambiguation page',
		value: 'R to disambiguation page' 
	},
	{
		label: '{{R from duplicated article}}: redirect to a similar article in order to preserve its edit history',
		value: 'R from duplicated article' 
	},
	{
		label: '{{R to decade}}: redirect from a year to the decade article',
		value: 'R to decade' 
	},
	{
		label: '{{R from shortcut}}: redirect from a Wikipedia shortcut',
		value: 'R from shortcut' 
	},
	{
		label: '{{R from CamelCase}}: redirect from a CamelCase title',
		value: 'R from CamelCase' 
	},
	{
		label: '{{R from EXIF}}: redirect of a wikilink created from JPEG EXIF information (i.e. the \"metadata\" section on some image description pages)',
		value: 'R from EXIF' 
	},
	{
		label: '{{R from school}}: redirect from a school article that had very little information',
		value: 'R from school'
	}
];
 
// maintenance tags for FILES start here
 
Twinkle.tag.file = {};
 
Twinkle.tag.file.licenseList = [
	{ label: '{{Bsr}}: source info consists of bare image URL/generic base URL only', value: 'Bsr' },
	{ label: '{{Non-free reduce}}: non-low-resolution fair use image (or too-long audio clip, etc)', value: 'Non-free reduce' },
	{ label: '{{Non-free reduced}}: fair use media which has been reduced (old versions need to be deleted)', value: 'Non-free reduced' }
];
 
Twinkle.tag.file.cleanupList = [
	{ label: '{{Artifacts}}: PNG contains residual compression artifacts', value: 'Artifacts' },
	{ label: '{{Bad font}}: SVG uses fonts not available on the thumbnail server', value: 'Bad font' },
	{ label: '{{Bad format}}: PDF/DOC/... file should be converted to a more useful format', value: 'Bad format' },
	{ label: '{{Bad GIF}}: GIF that should be PNG, JPEG, or SVG', value: 'Bad GIF' },
	{ label: '{{Bad JPEG}}: JPEG that should be PNG or SVG', value: 'Bad JPEG' },
	{ label: '{{Bad trace}}: auto-traced SVG requiring cleanup', value: 'Bad trace' },
	{ label: '{{Cleanup image}}: general cleanup', value: 'Cleanup image' },
	{ label: '{{Cleanup SVG}}: SVG needing code and/or appearance cleanup', value: 'Cleanup SVG' },
	{ label: '{{ClearType}}: image (not screenshot) with ClearType anti-aliasing', value: 'ClearType' },
	{ label: '{{Imagewatermark}}: image contains visible or invisible watermarking', value: 'Imagewatermark' },
	{ label: '{{NoCoins}}: image using coins to indicate scale', value: 'NoCoins' },
	{ label: '{{Overcompressed JPEG}}: JPEG with high levels of artifacts', value: 'Overcompressed JPEG' },
	{ label: '{{Opaque}}: opaque background should be transparent', value: 'Opaque' },
	{ label: '{{Remove border}}: unneeded border, white space, etc.', value: 'Remove border' },
	{ label: '{{Rename media}}: file should be renamed according to the criteria at [[WP:FMV]]', value: 'Rename media' },
	{ label: '{{Should be PNG}}: GIF or JPEG should be lossless', value: 'Should be PNG' },
	{
		label: '{{Should be SVG}}: PNG, GIF or JPEG should be vector graphics', value: 'Should be SVG',
		subgroup: {
			name: 'svgCategory',
			type: 'select',
			list: [
				{ label: '{{Should be SVG|other}}', value: 'other' },
				{ label: '{{Should be SVG|alphabet}}: character images, font examples, etc.', value: 'alphabet' },
				{ label: '{{Should be SVG|chemical}}: chemical diagrams, etc.', value: 'chemical' },
				{ label: '{{Should be SVG|circuit}}: electronic circuit diagrams, etc.', value: 'circuit' },
				{ label: '{{Should be SVG|coat of arms}}: coats of arms', value: 'coat of arms' },
				{ label: '{{Should be SVG|diagram}}: diagrams that do not fit any other subcategory', value: 'diagram' },
				{ label: '{{Should be SVG|emblem}}: emblems, free/libre logos, insignias, etc.', value: 'emblem' },
				{ label: '{{Should be SVG|fair use}}: fair-use images, fair-use logos', value: 'fair use' },
				{ label: '{{Should be SVG|flag}}: flags', value: 'flag' },
				{ label: '{{Should be SVG|graph}}: visual plots of data', value: 'graph' },
				{ label: '{{Should be SVG|logo}}: logos', value: 'logo' },
				{ label: '{{Should be SVG|map}}: maps', value: 'map' },
				{ label: '{{Should be SVG|music}}: musical scales, notes, etc.', value: 'music' },
				{ label: '{{Should be SVG|physical}}: "realistic" images of physical objects, people, etc.', value: 'physical' },
				{ label: '{{Should be SVG|symbol}}: miscellaneous symbols, icons, etc.', value: 'symbol' }
			]
		}
	},
	{ label: '{{Should be text}}: image should be represented as text, tables, or math markup', value: 'Should be text' },
	{ label: '{{Split media}}: there are two different images in the upload log which need to be split', value: 'Split media' }
];
 
Twinkle.tag.file.qualityList = [
	{ label: '{{Image-blownout}}', value: 'Image-blownout' },
	{ label: '{{Image-out-of-focus}}', value: 'Image-out-of-focus' },
	{ label: '{{Image-Poor-Quality}}', value: 'Image-Poor-Quality' },
	{ label: '{{Image-underexposure}}', value: 'Image-underexposure' },
	{ label: '{{Low quality chem}}: disputed chemical structures', value: 'Low quality chem' }
];
 
Twinkle.tag.file.commonsList = [
	{ label: '{{Copy to Commons}}: free media that should be copied to Commons', value: 'Copy to Commons' },
	{ label: '{{Do not move to Commons}} (PD issue): file is PD in the US but not in country of origin', value: 'Do not move to Commons' },
	{ label: '{{Do not move to Commons}} (other reason)', value: 'Do not move to Commons_reason' },
	{ label: '{{Keep local}}: request to keep local copy of a Commons file', value: 'Keep local' },
	{ label: '{{Now Commons}}: file has been copied to Commons', value: 'subst:ncd' }
];
 
Twinkle.tag.file.replacementList = [
	{ label: '{{Duplicate}}: exact duplicate of another file, but not yet orphaned', value: 'Duplicate' },
	{ label: '{{Obsolete}}: improved version available', value: 'Obsolete' },
	{ label: '{{PNG version available}}', value: 'PNG version available' },
	{ label: '{{SVG version available}}', value: 'SVG version available' }
];
 
 
// Tags for DRAFT ARTICLES start here
 
Twinkle.tag.draftList = [
	{ label: '{{New unreviewed article}}: mark article for later review', value: 'new unreviewed article' }
];
 
 
// Contains those article tags that can be grouped into {{multiple issues}}.
// This list includes synonyms.
Twinkle.tag.groupHash = [
	'advert',
	'autobiography',
	'BLP IMDb-only refimprove',
	'BLP IMDB-only refimprove',
	'BLP IMDb refimprove',
	'BLP sources',
	'BLPsources',
	'BLP unsourced',
	'BLPunsourced',
	'citation style',
	'citationstyle',
	'citation-style',
	'citations missing',
	'cite check',
	'citecheck',
	'cleanup',
	'cleanup-laundry',
	'laundry',
	'laundrylists',
	'cleanup-link rot',
	'linkrot',
	'cleanup-reorganize',
	'organize',
	'restructure',
	'reorganisation',
	'cleanup-rewrite',
	'rewrite',
	'cleanup-spam',
	'spam',
	'COI',
	'coi',
	'colloquial',
	'confusing',
	'context',
	'contradict',
	'copy edit',
	'copyedit',
	'criticism section',
	'criticisms',
	'crystal',
	'dead end',
	'deadend',
	'disputed',
	'essay-like',
	'essay',
	'example farm',
	'examplefarm',
	'expert',
	'external links',
	'fanpov',
	'fansite',
	'fiction',
	'game guide',
	'gameguide',
	'globalize',
	'histinfo',
	'hoax',
	'howto',
	'inappropriate person',
	'incomplete',
	'in-universe',
	'lead missing',
	'intromissing',
	'lead rewrite',
	'introrewrite',
	'lead too long',
	'intro length',
	'intro-toolong',
	'lead too short',
	'intro-tooshort',
	'like resume',
	'likeresume',
	'news release',
	'newsrelease',
	'no footnotes',
	'notability',
	'notable',
	'one source',
	'onesource',
	'original research',
	'orphan',
	'do-attempt',
	'out of date',
	'over detailed',
	'fancruft',
	'peacock',
	'plot',
	'POV',
	'NPOV',
	'pov',
	'npov',
	'POV-check',
	'pov-check',
	'primary sources',
	'primarysources',
	'prose',
	'quote farm',
	'quotefarm',
	'recentism',
	'refimprove',
	'review',
	'sections',
	'self-published',
	'story',
	'synthesis',
	'technical',
	'jargon',
	'tone',
	'inappropriate tone',
	'travel guide',
	'travelguide',
	'trivia',
	'unbalanced',
	'unencyclopedic',
	'unreferenced',
	'unref',
	'unreliable sources',
	'unreliable',
	'update',
	'very long',
	'verylong',
	'long',
	'weasel',
	'wikify'
];
 
Twinkle.tag.callbacks = {
	main: function( pageobj ) {
		var params = pageobj.getCallbackParameters();
		var tagRe, tagText = '', summaryText = 'Added';
		var tags = [], groupableTags = [];
 
		// Remove tags that become superfluous with this action
		var pageText = pageobj.getPageText().replace(/\{\{\s*(New unreviewed article|Userspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/ig, "");
 
		var i;
		if( Twinkle.tag.mode !== 'redirect' ) {
			// Check for preexisting tags and separate tags into groupable and non-groupable arrays
			for( i = 0; i < params.tags.length; i++ ) {
				tagRe = new RegExp( '(\\{\\{' + params.tags[i] + '(\\||\\}\\}))', 'im' );
				if( !tagRe.exec( pageText ) ) {
					if( Twinkle.tag.groupHash.indexOf(params.tags[i]) !== -1 && 
							(params.tags[i] !== 'globalize' || params.globalizeSubcategory === 'globalize' ) &&
							(params.tags[i] !== 'notability' || params.notabilitySubcategory === 'none' )) {
						// don't add to multipleissues for globalize/notability subcats
						groupableTags = groupableTags.concat( params.tags[i] );
					} else {
						tags = tags.concat( params.tags[i] );
					}
				} else {
					Status.info( 'Info', 'Found {{' + params.tags[i] +
						'}} on the article already...excluding' );
				}
			}
 
			if( params.group && groupableTags.length >= 3 ) {
				Status.info( 'Info', 'Grouping supported tags into {{multiple issues}}' );
 
				groupableTags.sort();
				tagText += '{{multiple issues';
				summaryText += ' {{[[Template:multiple issues|multiple issues]]}} with parameters';
				for( i = 0; i < groupableTags.length; i++ ) {
					tagText += '|' + groupableTags[i] +
						'={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}';
 
					if( i === (groupableTags.length - 1) ) {
						summaryText += ' and';
					} else if ( i < (groupableTags.length - 1) && i > 0 ) {
						summaryText += ',';
					}
					summaryText += ' ' + groupableTags[i];
				}
				tagText += '}}\n';
			} else {
				tags = tags.concat( groupableTags );
			}
		} else {
			// Check for pre-existing tags
			for( i = 0; i < params.tags.length; i++ ) {
				tagRe = new RegExp( '(\\{\\{' + params.tags[i] + '(\\||\\}\\}))', 'im' );
				if( !tagRe.exec( pageText ) ) {
					tags = tags.concat( params.tags[i] );
				} else {
					Status.info( 'Info', 'Found {{' + params.tags[i] +
						'}} on the redirect already...excluding' );
				}
			}
		}
 
		tags.sort();
		for( i = 0; i < tags.length; i++ ) {
			var currentTag = "";
			if( tags[i] === 'uncategorized' || tags[i] === 'cat improve' ) {
				pageText += '\n\n{{' + tags[i] +
					'|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}';
			} else {
				if( tags[i] === 'globalize' ) {
					currentTag += '{{' + params.globalizeSubcategory;
				} else {
					currentTag += ( Twinkle.tag.mode === 'redirect' ? '\n' : '' ) + '{{' + tags[i];
				}
 
				if( tags[i] === 'notability' && params.notabilitySubcategory !== 'none' ) {
					currentTag += '|' + params.notabilitySubcategory;
				}
 
				// prompt for other parameters, based on the tag
				switch( tags[i] ) {
					case 'cleanup':
						var reason = prompt('You can optionally enter a more specific reason why the article requires cleanup.  \n' +
							"Just click OK if you don't wish to enter this.  To skip the {{cleanup}} tag, click Cancel.", "");
						if (reason === null) {
							continue;
						} else if (reason !== "") {
							currentTag += '|reason=' + reason;
						}
						break;
					case 'copypaste':
						var url = prompt('Please enter the URL which is believed to be the source of the copy-paste.  \n' +
							"Just click OK if you don't know.  To skip the {{copypaste}} tag, click Cancel.", "");
						if (url === null) {
							continue;
						} else if (url !== "") {
							currentTag += '|url=' + url;
						}
						break;
					case 'not English':
						var langname = prompt('Please enter the name of the language the article is thought to be written in.  \n' +
							"Just click OK if you don't know.  To skip the {{not English}} tag, click Cancel.", "");
						if (langname === null) {
							continue;
						} else if (langname !== "") {
							currentTag += '|1=' + langname;
						}
						break;
					case 'rough translation':
						var roughlang = prompt('Please enter the name of the language the article is thought to have been translated from.  \n' +
							"Just click OK if you don't know.  To skip the {{rough translation}} tag, click Cancel.", "");
						if (roughlang === null) {
							continue;
						} else if (roughlang !== "") {
							currentTag += '|1=' + roughlang;
						}
						break;
					case 'expert-subject':
						var wikiproject = prompt('Please enter the name of a WikiProject which might be able to help recruit an expert.  \n' +
							"Just click OK if you don't know.  To skip the {{expert-subject}} tag, click Cancel.", "");
						if (wikiproject === null) {
							continue;
						} else if (wikiproject !== "") {
							currentTag += '|1=' + wikiproject;
						}
						break;
					case 'wikify':
						var wreason = prompt('You can optionally enter a more specific reason why the article needs to be wikified.  \n' +
							"Just click OK if you don't wish to enter this.  To skip the {{wikify}} tag, click Cancel.", "");
						if (wreason === null) {
							continue;
						} else if (wreason !== "") {
							currentTag += '|reason=' + wreason;
						}
						break;
					case 'merge':
					case 'merge to':
					case 'merge from':
						var param = prompt('Please enter the name of the other article(s) involved in the merge.  \n' +
							"To specify multiple articles, separate them with a vertical pipe (|) character.  \n" +
							"This information is required.  Click OK when done, or click Cancel to skip the merge tag.", "");
						if (param === null) {
							continue;
						} else if (param !== "") {
							currentTag += '|' + param;
						}
						break;
					default:
						break;
				}
 
				currentTag += Twinkle.tag.mode === 'redirect' ? '}}' : '|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n';
				tagText += currentTag;
			}
 
			if ( i > 0 || groupableTags.length > 3 ) {
				if( i === (tags.length - 1) ) {
					summaryText += ' and';
				} else if ( i < (tags.length - 1) ) {
					summaryText += ',';
				}
			}
 
			summaryText += ' {{[[';
			if( tags[i] === 'globalize' ) {
				summaryText += "Template:" + params.globalizeSubcategory + '|' + params.globalizeSubcategory;
			} else {
				summaryText += (tags[i].indexOf(":") !== -1 ? tags[i] : ("Template:" + tags[i] + "|" + tags[i]));
			}
			summaryText += ']]}}';
		}
 
		if( Twinkle.tag.mode === 'redirect' ) {
			pageText += tagText;
		} else {
			// smartly insert the new tags after any hatnotes. Regex is a bit more
			// complicated than it'd need to be, to allow templates as parameters,
			// and to handle whitespace properly.
			pageText = pageText.replace(/^\s*(?:((?:\s*\{\{\s*(?:about|correct title|dablink|distinguish|for|other\s?(?:hurricaneuses|people|persons|places|uses(?:of)?)|redirect(?:-acronym)?|see\s?(?:also|wiktionary)|selfref|the)\d*\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\})+(?:\s*\n)?)\s*)?/i,
				"$1" + tagText);
		}
		summaryText += ' tag' + ( ( tags.length + ( groupableTags.length > 3 ? 1 : 0 ) ) > 1 ? 's' : '' ) +
			' to ' + Twinkle.tag.mode + Twinkle.getPref('summaryAd');
 
		pageobj.setPageText(pageText);
		pageobj.setEditSummary(summaryText);
		pageobj.setWatchlist(Twinkle.getFriendlyPref('watchTaggedPages'));
		pageobj.setMinorEdit(Twinkle.getFriendlyPref('markTaggedPagesAsMinor'));
		pageobj.setCreateOption('nocreate');
		pageobj.save();
 
		if( Twinkle.getFriendlyPref('markTaggedPagesAsPatrolled') ) {
			pageobj.patrol();
		}
	},
 
	file: function friendlytagCallbacksFile(pageobj) {
		var text = pageobj.getPageText();
		var params = pageobj.getCallbackParameters();
		var summary = "Adding ";
 
		// Add maintenance tags
		if (params.tags.length) {
 
			var tagtext = "", currentTag;
			$.each(params.tags, function(k, tag) {
				// when other commons-related tags are placed, remove "move to Commons" tag
				if (["Keep local", "subst:ncd", "Do not move to Commons_reason", "Do not move to Commons",
					"Now Commons"].indexOf(tag) !== -1) {
					text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*}}/gi, "");
				}
 
				currentTag = "{{" + (tag === "Do not move to Commons_reason" ? "Do not move to Commons" : tag);
 
				var input;
				switch (tag) {
					case "subst:ncd":
						/* falls through */
					case "Keep local":
						input = prompt( "{{" + (tag === "subst:ncd" ? "Now Commons" : tag) +
							"}} - Enter the name of the image on Commons (if different from local name), excluding the File: prefix:", "" );
						if (input === null) {
							return true;  // continue
						} else if (input !== "") {
							currentTag += '|1=' + input;
						}
						break;
					case "Rename media":
						input = prompt( "{{Rename media}} - Enter the new name for the image (optional):", "" );
						if (input === null) {
							return true;  // continue
						} else if (input !== "") {
							currentTag += "|1=" + input;
						}
						input = prompt( "{{Rename media}} - Enter the reason for the rename (optional):", "" );
						if (input === null) {
							return true;  // continue
						} else if (input !== "") {
							currentTag += "|2=" + input;
						}
						break;
					case "Cleanup image":
						/* falls through */
					case "Cleanup SVG":
						input = prompt( "{{" + tag + "}} - Enter the reason for cleanup (required). To skip the tag, click Cancel:", "" );
						if (input === null) {
							return true;  // continue
						} else if (input !== "") {
							currentTag += "|1=" + input;
						}
						break;
					case "Image-Poor-Quality":
						input = prompt( "{{Image-Poor-Quality}} - Enter the reason why this image is so bad (required). To skip the tag, click Cancel:", "" );
						if (input === null) {
							return true;  // continue
						} else if (input !== "") {
							currentTag += "|1=" + input;
						}
						break;
					case "Low quality chem":
						input = prompt( "{{Low quality chem}} - Enter the reason why the diagram is disputed (required). To skip the tag, click Cancel:", "" );
						if (input === null) {
							return true;  // continue
						} else if (input !== "") {
							currentTag += "|1=" + input;
						}
						break;
					case "PNG version available":
						/* falls through */
					case "SVG version available":
						/* falls through */
					case "Obsolete":
						/* falls through */
					case "Duplicate":
						input = prompt( "{{" + tag + "}} - Enter the name of the file which replaces this one (required). To skip the tag, click Cancel:", "" );
						if (input === null) {
							return true;  // continue
						} else if (input !== "") {
							currentTag += "|1=" + input;
						}
						break;
					case "Do not move to Commons_reason":
						input = prompt( "{{Do not move to Commons}} - Enter the reason why this image should not be moved to Commons (required). To skip the tag, click Cancel:", "" );
						if (input === null) {
							return true;  // continue
						} else if (input !== "") {
							currentTag += "|reason=" + input;
						}
						break;
					case "Non-free reduced":
						currentTag += "|date={{subst:date}}";
						break;
					default:
						break;  // don't care
				}
 
				if (tag === "Should be SVG") {
					currentTag += "|" + params.svgSubcategory;
				}
 
				currentTag += "}}\n";
 
				tagtext += currentTag;
				summary += "{{" + tag + "}}, ";
 
				return true;  // continue
			});
 
			if (!tagtext) {
				pageobj.getStatusElement().warn("User canceled operation; nothing to do");
				return;
			}
 
			text = tagtext + text;
		}
 
		pageobj.setPageText(text);
		pageobj.setEditSummary(summary.substring(0, summary.length - 2) + Twinkle.getPref('summaryAd'));
		pageobj.setWatchlist(Twinkle.getFriendlyPref('watchTaggedPages'));
		pageobj.setMinorEdit(Twinkle.getFriendlyPref('markTaggedPagesAsMinor'));
		pageobj.setCreateOption('nocreate');
		pageobj.save();
 
		if( Twinkle.getFriendlyPref('markTaggedPagesAsPatrolled') ) {
			pageobj.patrol();
		}
	}
};
 
Twinkle.tag.callback.evaluate = function friendlytagCallbackEvaluate(e) {
	var form = e.target;
	var params = {};
 
	switch (Twinkle.tag.mode) {
		case 'article':
			params.tags = form.getChecked( 'articleTags' );
			params.group = form.group.checked;
			params.globalizeSubcategory = form["articleTags.globalize"] ? form["articleTags.globalize"].value : null;
			params.notabilitySubcategory = form["articleTags.notability"] ? form["articleTags.notability"].value : null;
			break;
		case 'file':
			params.svgSubcategory = form["imageTags.svgCategory"] ? form["imageTags.svgCategory"].value : null;
			params.tags = form.getChecked( 'imageTags' );
			break;
		case 'redirect':
			params.tags = form.getChecked( 'redirectTags' );
			break;
		case 'draft':
			params.tags = form.getChecked( 'draftTags' );
			Twinkle.tag.mode = 'article';
			break;
		default:
			alert("Twinkle.tag: unknown mode " + Twinkle.tag.mode);
			break;
	}
 
	if( !params.tags.length ) {
		alert( 'You must select at least one tag!' );
		return;
	}
 
	SimpleWindow.setButtonsEnabled( false );
	Status.init( form );
 
	Wikipedia.actionCompleted.redirect = mw.config.get('wgPageName');
	Wikipedia.actionCompleted.notice = "Tagging complete, reloading article in a few seconds";
	if (Twinkle.tag.mode === 'redirect') {
		Wikipedia.actionCompleted.followRedirect = false;
	}
 
	var wikipedia_page = new Wikipedia.page(mw.config.get('wgPageName'), "Tagging " + Twinkle.tag.mode);
	wikipedia_page.setCallbackParameters(params);
	switch (Twinkle.tag.mode) {
		case 'article':
			/* falls through */
		case 'redirect':
			wikipedia_page.load(Twinkle.tag.callbacks.main);
			return;
		case 'file':
			wikipedia_page.load(Twinkle.tag.callbacks.file);
			return;
		default:
			alert("Twinkle.tag: unknown mode " + Twinkle.tag.mode);
			break;
	}
};