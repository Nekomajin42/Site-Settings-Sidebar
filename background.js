// build settings
function data()
{
	// look for saved data
	var saved = (window.localStorage.siteSettingsSidebar != undefined) ? JSON.parse(window.localStorage.siteSettingsSidebar) : {};
	saved.zoom = (saved.zoom != undefined) ? saved.zoom : {};
	saved.auto = (saved.auto != undefined) ? saved.auto : {};
	saved.ui = (saved.ui != undefined) ? saved.ui : {};
	var pref = {};
	
	// zoom
	pref.zoom = {};
	pref.zoom.onBadge = (saved.zoom.onBadge != undefined) ? saved.zoom.onBadge : true;
	pref.zoom.step = (saved.zoom.step != undefined) ? saved.zoom.step : 10;
	
	// auto
	pref.auto = {};
	pref.auto.refresh = (saved.auto.refresh != undefined) ? saved.auto.refresh : true;
	
	// ui
	pref.ui = {};
	pref.ui.colorCode = (saved.ui.colorCode != undefined) ? saved.ui.colorCode : true;
	pref.ui.greyScheme = (saved.ui.greyScheme != undefined) ? saved.ui.greyScheme : false;
	
	// save and return
	window.localStorage.siteSettingsSidebar = JSON.stringify(pref);
	return pref;
}

// deal with install and update events
chrome.runtime.onInstalled.addListener(function(details)
{
	if (details.reason === "install" || details.reason === "update")
	{
		// build default settings
		settings = data();
		
		// throw notification
		var title = chrome.i18n.getMessage("notification_" + details.reason + "_title");
		var body = chrome.i18n.getMessage("notification_" + details.reason + "_body");
		notify(title, body);
	}
});

// throw notification
function notify(title, body)
{
	var n = new Notification(title,
	{
		tag : "site_settings_sidebar", 
		dir : "auto",
		lang : window.navigator.language,
		icon : "icons/icon48.png", 
		body : body
	});
	n.onclick = function()
	{
		chrome.tabs.create({url : "/options/options.html"});
	};
}

// to do on extension load
window.addEventListener("load", function()
{
	try
	{
		settings = JSON.parse(window.localStorage.siteSettingsSidebar);
	}
	catch (error) // onLoad happens faster than onInstalled
	{
		settings = data();
	}
	
	// deal with zoom change
	chrome.tabs.onZoomChange.addListener(function(ZoomChangeInfo)
	{
		if (settings.zoom.onBadge === true)
		{
			var zoom = Math.floor(ZoomChangeInfo.newZoomFactor * 100);
			opr.sidebarAction.setBadgeText({text: zoom.toString()});
		}
	});
}, false);

// to do on panel load
var settings;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	settings = data();
	sendResponse(settings);
});