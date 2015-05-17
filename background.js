// deal with install and update events
chrome.runtime.onInstalled.addListener(function(details)
{
	if (details.reason === "install" || details.reason === "update")
	{
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
	// do some messy stuff
	chrome.storage.local.get(null, function(saved)
	{
		// build user preferences
		chrome.storage.local.set(
		{
			autoRefresh : (saved.autoRefresh != undefined) ? saved.autoRefresh : true,
			zoomStep : (saved.zoomStep != undefined) ? saved.zoomStep : 10,
			colorCode : (saved.colorCode != undefined) ? saved.colorCode : true,
			greyScheme : (saved.greyScheme != undefined) ? saved.greyScheme : false,
			zoomOnBadge : (saved.zoomOnBadge != undefined) ? saved.zoomOnBadge : true
		});
		
		// get what we nees in background.js
		chrome.storage.local.get("zoomOnBadge", function(settings)
		{
			// deal with zoom change
			chrome.tabs.onZoomChange.addListener(function(zoomChangeInfo)
			{
				if (settings.zoomOnBadge === true)
				{
					var zoom = Math.round(zoomChangeInfo.newZoomFactor * 100);
					opr.sidebarAction.setBadgeText({text: zoom.toString()});
				}
			});
		});
	});
}, false);