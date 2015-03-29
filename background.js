// deal with install and updates
chrome.runtime.onInstalled.addListener(function(details)
{
	if (details.reason === "install")
	{
		// save default settings
		var settings = {zoomOnBadge: true};
		window.localStorage.siteSettingsSidebar = JSON.stringify(settings);
		
		// throw notification
		var title = chrome.i18n.getMessage("notification_install_title");
		var body = chrome.i18n.getMessage("notification_install_body");
	}
	else if (details.reason === "update")
	{
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
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	var settings = JSON.parse(window.localStorage.siteSettingsSidebar);
	sendResponse(settings);
});