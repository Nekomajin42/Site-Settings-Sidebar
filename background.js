// deal with zoom
chrome.tabs.onZoomChange.addListener(function(ZoomChangeInfo)
{
	if (settings.zoom.onBadge === true)
	{
		var zoom = Math.floor(ZoomChangeInfo.newZoomFactor * 100);
		//console.log(zoom);
		opr.sidebarAction.setBadgeText({text: zoom.toString()});
	}
});

// build default settings
function data()
{
	// look for saved data
	var saved = (window.localStorage.siteSettingsSidebar) ? JSON.parse(window.localStorage.siteSettingsSidebar) : {};
	saved.zoom = (saved.zoom) ? saved.zoom : {};
	var settings = {};
	
	// zoom
	settings.zoom = {};
	settings.zoom.onBadge = (saved.zoom.onBadge) ? saved.zoom.onBadge : true;
	settings.zoom.step = (saved.zoom.step) ? saved.zoom.step : 10;
	
	// save and return
	window.localStorage.siteSettingsSidebar = JSON.stringify(settings);
	return settings;
}

// deal with install and updates
chrome.runtime.onInstalled.addListener(function(details)
{
	if (details.reason === "install")
	{
		// build default settings
		var settings = data();
		
		// throw notification
		var title = chrome.i18n.getMessage("notification_install_title");
		var body = chrome.i18n.getMessage("notification_install_body");
	}
	else if (details.reason === "update")
	{
		// build default settings
		var settings = data();
		
		// throw notification
		var title = chrome.i18n.getMessage("notification_update_title");
		var body = chrome.i18n.getMessage("notification_update_body");
	}
	
	// throw it
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
});

// send user preferences
var settings;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	settings = JSON.parse(window.localStorage.siteSettingsSidebar);
	sendResponse(settings);
});