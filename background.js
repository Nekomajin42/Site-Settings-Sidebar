// build default settings
function data()
{
	// look for saved data
	var saved = (window.localStorage.siteSettingsSidebar) ? JSON.parse(window.localStorage.siteSettingsSidebar) : {};
	saved.zoom = (saved.zoom) ? saved.zoom : {};
	saved.auto = (saved.auto) ? saved.auto : {};
	saved.ui = (saved.ui) ? saved.ui : {};
	var settings = {};
	
	// zoom
	settings.zoom = {};
	settings.zoom.onBadge = (saved.zoom.onBadge) ? saved.zoom.onBadge : true;
	settings.zoom.step = (saved.zoom.step) ? saved.zoom.step : 10;
	
	// auto
	settings.auto = {};
	settings.auto.refresh = (saved.auto.refresh) ? saved.auto.refresh : true;
	
	// ui
	settings.ui = {};
	settings.ui.colorCode = (saved.ui.colorCode) ? saved.ui.colorCode : true;
	
	// save and return
	window.localStorage.siteSettingsSidebar = JSON.stringify(settings);
	return settings;
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
	sendResponse(settings);
});