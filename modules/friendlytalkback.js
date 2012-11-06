/*
 ****************************************
 *** friendlytalkback.js: Talkback module
 ****************************************
 * Mode of invocation:     Tab ("TB")
 * Active on:              Existing user talk pages
 * Config directives in:   FriendlyConfig
 */
;(function(){

	Twinkle.talkback = function() {
	
		if ( Morebits.getPageAssociatedUser() === false ) {
			return;
		}
	
		twAddPortletLink( callback, "ফিরতি বার্তা", "friendly-talkback", "সহজ ফিরতি বার্তা" );
	};
	
	var callback = function( ) {
		if( Morebits.getPageAssociatedUser() === mw.config.get("wgUserName") && !confirm("Is it really so bad that you're talking back to yourself?") ){
			return;
		}
	
		var Window = new Morebits.simpleWindow( 600, 350 );
		Window.setTitle("ফিরতি বার্তা");
		Window.setScriptName("Twinkle");
		Window.addFooterLink( "{{ফিরতি বার্তা}} সম্পর্কে জানুন", "টেমপ্লেট:ফিরতি বার্তা" );
		Window.addFooterLink( "টুইংকল সাহায্য", "WP:TW/DOC#talkback" );
	
		var form = new Morebits.quickForm( callback_evaluate );
	
		form.append({ type: "radio", name: "tbtarget",
					list: [
						{
							label: "ফিরতি বার্তা: আমার আলাপ পাতা",
							value: "mytalk",
							checked: "true" 
						},
						{
							label: "ফিরতি বার্তা: অন্যের ব্যবহারকারি পাতা",
							value: "usertalk"
						},
						{
							label: "ফিরতি বার্তা: অন্য পাতা",
							value: "other"
						},
						{
							label: "প্রশাসকদের আলোচনা সভা",
							value: "notice"
						},
						{
							label: "\"You've got mail\"",
							value: "mail"
						}
					],
					event: callback_change_target
				});
	
		form.append({
				type: "field",
				label: "ফিরতি বার্তার তথ্য",
				name: "work_area"
			});
	
		form.append({ type: "submit" });
	
		var result = form.render();
		Window.setContent( result );
		Window.display();
	
		// We must init the
		var evt = document.createEvent("Event");
		evt.initEvent( "change", true, true );
		result.tbtarget[0].dispatchEvent( evt );
	};
	
	var prev_page = "";
	var prev_section = "";
	var prev_message = "";
	
	var callback_change_target = function( e ) {
		var value = e.target.values;
		var root = e.target.form;
		var old_area = Morebits.quickForm.getElements(root, "work_area")[0];
	
		if(root.section) {
			prev_section = root.section.value;
		}
		if(root.message) {
			prev_message = root.message.value;
		}
		if(root.page) {
			prev_page = root.page.value;
		}

		var work_area = new Morebits.quickForm.element({
				type: "field",
				label: "Talkback information",
				name: "work_area"
			});
	
		switch( value ) {
			case "mytalk":
				/* falls through */
			default:
				work_area.append({
						type:"input",
						name:"section",
						label:"অনুচ্ছেদের লিঙ্ক  (ঐচ্ছিক)",
						tooltip:"এখানে আপনি আপনার আলাপ পাতার  অনুচ্ছেদের লিঙ্ক  প্রদান করুন যেখানে বার্তা প্রদান করেছেন। আপনি এই ফিল্ড  এড়িয়ে যেতে পারেন।",
						value: prev_section
					});
				break;
			case "usertalk":
				work_area.append({
						type:"input",
						name:"page",
						label:"ব্যবহারকারি",
						tooltip:"যে ব্যবহারকারির আলাপ পাতায়  বার্তা প্রদান করেছেন।",
						value: prev_page
					});
				
				work_area.append({
						type:"input",
						name:"section",
						label:"অনুচ্ছেদের লিঙ্ক  (ঐচ্ছিক ))",
						tooltip:"এখানে আপনি পাতার  অনুচ্ছেদের লিঙ্ক  প্রদান করুন যেখানে বার্তা প্রদান করেছেন। আপনি এই ফিল্ড  এড়িয়ে যেতে পারেন।",
						value: prev_section
					});
				break;
			case "notice":
				var noticeboard = work_area.append({
						type: "select",
						name: "noticeboard",
						label: "প্রশাসকদের আলোচনাসভা:"
					});
				noticeboard.append({
						type: "option",
						label: "WP:AN (প্রশাসকদের আলোচনাসভা)",
						value: "an"
					});
				noticeboard.append({
						type: "option",
						label: "WP:AN3 (প্রশাসকদের আলোচনাসভা/Edit warring)",
						selected: true,
						value: "an3"
					});
				noticeboard.append({
						type: "option",
						label: "WP:ANI (প্রশাসকদের আলোচনাসভা/Incidents)",
						selected: true,
						value: "ani"
					});
				noticeboard.append({
						type: "option",
						label: "WP:COIN (Conflict of interest noticeboard)",
						value: "coin"
					});
				noticeboard.append({
						type: "option",
						label: "WP:DRN (Dispute resolution noticeboard)",
						value: "drn"
					});
				noticeboard.append({
						type: "option",
						label: "WP:WQA (Wikiquette assistance)",
						value: "wqa"
					});
				work_area.append({
						type:"input",
						name:"section",
						label:"Linked thread",
						tooltip:"The heading of the relevant thread on the noticeboard page.",
						value: prev_section
					});
				break;
			case "other":
				work_area.append({
						type:"input",
						name:"page",
						label:"সম্পূর্ণ পাতার নাম",
						tooltip:"যে পাতায় আপনি বার্তা প্রদান করেছেন তার সম্পূর্ণ  নাম। উদাহরণ রুপে 'উইকিপিডিয়া আলোচনা:টুইংকল'",
						value: prev_page
					});
				
				work_area.append({
						type:"input",
						name:"section",
						label:"অনুচ্ছেদের লিঙ্ক  (ঐচ্ছিক )",
						tooltip:"এখানে আপনি পাতার  অনুচ্ছেদের লিঙ্ক  প্রদান করুন যেখানে বার্তা প্রদান করেছেন। আপনি এই ফিল্ড  এড়িয়ে যেতে পারেন",
						value: prev_section
					});
				break;
			case "mail":
				work_area.append({
						type:"input",
						name:"section",
						label:"Subject of e-mail (optional)",
						tooltip:"The subject line of the e-mail you sent."
					});
				break;
		}
	
		if (value !== "notice") {
			work_area.append({ type:"textarea", label:"Additional message (optional):", name:"message", tooltip:"An additional message that you would like to leave below the talkback template. Your signature will be added to the end of the message if you leave one." });
		}
	
		work_area = work_area.render();
		root.replaceChild( work_area, old_area );
		if (root.message) {
			root.message.value = prev_message;
		}
	};
	
	var callback_evaluate = function( e ) {
	
		var tbtarget = e.target.getChecked( "tbtarget" )[0];
		var page = null;
		var section = e.target.section.value;
		var fullUserTalkPageName = mw.config.get("wgFormattedNamespaces")[ mw.config.get("wgNamespaceIds").user_talk ] + ":" + Morebits.getPageAssociatedUser();
	
		if( tbtarget === "usertalk" || tbtarget === "other" ) {
			page = e.target.page.value;
			
			if( tbtarget === "usertalk" ) {
				if( !page ) {
					alert("আপনাকে অবশ্যই যে ব্যবহারকারির আলাপ পাতায় বার্তা দিচ্ছেন তার নাম প্রদান করতে হবে।");
					return;
				}
			} else {
				if( !page ) {
					alert("আপনাকে অবশ্যই যে  পাতায় বার্তা দিচ্ছেন তার  সম্পূর্ণ নাম প্রদান করতে হবে।");
					return;
				}
			}
		} else if (tbtarget === "notice") {
			page = e.target.noticeboard.value;
		}
	
		var message;
		if (e.target.message) {
			message = e.target.message.value;
		}
	
		Morebits.simpleWindow.setButtonsEnabled( false );
		Morebits.status.init( e.target );
	
		Morebits.wiki.actionCompleted.redirect = fullUserTalkPageName;
		Morebits.wiki.actionCompleted.notice = "ফিরতি বার্তা প্রদান সম্পূর্ণ হয়েছে;কয়েক সেকেন্ডের মধ্যে আলাপ পাতা ফিরিয়ে আনা হচ্ছে।";
	
		var talkpage = new Morebits.wiki.page(fullUserTalkPageName, "ফিরতি বার্তা যোগ");
		var tbPageName = (tbtarget === "mytalk") ? mw.config.get("wgUserName") : page;
	
		var text;
		if ( tbtarget === "notice" ) {
			switch (page) {
				case "an":
					text = "\n\n== " + Twinkle.getFriendlyPref("adminNoticeHeading") + " ==\n";
					text += "{{subst:ANI-notice|thread=" + section + "|noticeboard=Wikipedia:Administrators' noticeboard}} ~~~~";
					talkpage.setEditSummary( "Notice of discussion at [[Wikipedia:Administrators' noticeboard]]" + Twinkle.getPref("summaryAd") );
					break;
				case "an3":
					text = "\n\n{{subst:An3-notice|" + section + "}} ~~~~";
					talkpage.setEditSummary( "Notice of discussion at [[Wikipedia:Administrators' noticeboard/Edit warring]]" + Twinkle.getPref("summaryAd") );
					break;
				case "ani":
					text = "\n\n== " + Twinkle.getFriendlyPref("adminNoticeHeading") + " ==\n";
					text += "{{subst:ANI-notice|thread=" + section + "|noticeboard=Wikipedia:Administrators' noticeboard/Incidents}} ~~~~";
					talkpage.setEditSummary( "Notice of discussion at [[Wikipedia:Administrators' noticeboard/Incidents]]" + Twinkle.getPref("summaryAd") );
					break;
				case "coin":
					text = "\n\n{{subst:Coin-notice|thread=" + section + "}} ~~~~";
					talkpage.setEditSummary( "Notice of discussion at [[Wikipedia:Conflict of interest noticeboard]]" + Twinkle.getPref("summaryAd") );
					break;
				case "drn":
					text = "\n\n{{subst:DRN-notice|thread=" + section + "}} ~~~~";
					talkpage.setEditSummary( "Notice of discussion at [[Wikipedia:Dispute resolution noticeboard]]" + Twinkle.getPref("summaryAd") );
					break;
				case "wqa":
					text = "\n\n{{subst:WQA-notice|thread=" + section + "}} ~~~~";
					talkpage.setEditSummary( "Notice of discussion at [[Wikipedia:Wikiquette assistance]]" + Twinkle.getPref("summaryAd") );
					break;
				default:
					throw "Twinkle.talkback, function callback_evaluate: default case reached";
			}

		} else if ( tbtarget === "mail" ) {
			text = "\n\n==" + Twinkle.getFriendlyPref("mailHeading") + "==\n{{you've got mail|subject=";
			text += section + "|ts=~~~~~}}";

			if( message ) {
				text += "\n" + message + "  ~~~~";
			} else if( Twinkle.getFriendlyPref("insertTalkbackSignature") ) {
				text += "\n~~~~";
			}

			talkpage.setEditSummary("Notification: You've got mail" + Twinkle.getPref("summaryAd"));

		} else {
			//clean talkback heading: strip section header markers, were erroneously suggested in the documentation
			text = "\n\n==" + Twinkle.getFriendlyPref("talkbackHeading").replace( /^\s*=+\s*(.*?)\s*=+$\s*/, "$1" ) + "==\n{{talkback|";
			text += tbPageName;

			if( section ) {
				text += "|" + section;
			}
	
			text += "|ts=~~~~~}}";
	
			if( message ) {
				text += "\n" + message + "  ~~~~";
			} else if( Twinkle.getFriendlyPref("insertTalkbackSignature") ) {
				text += "\n~~~~";
			}
	
			talkpage.setEditSummary("Talkback ([[" + (tbtarget === "other" ? "" : "User talk:") + tbPageName +
				(section ? ("#" + section) : "") + "]])" + Twinkle.getPref("summaryAd"));
		}
	
		talkpage.setAppendText( text );
		talkpage.setCreateOption("recreate");
		talkpage.setMinorEdit(Twinkle.getFriendlyPref("markTalkbackAsMinor"));
		talkpage.setFollowRedirect( true );
		talkpage.append();
	};

}());
