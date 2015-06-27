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
		chrome.runtime.openOptionsPage();
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
			zoomOnBadge : (saved.zoomOnBadge != undefined) ? saved.zoomOnBadge : true,
			sidebarIcon : (saved.sidebarIcon != undefined) ? saved.sidebarIcon : "icon"
		}, function()
		{
			// get what we need in background.js
			chrome.storage.local.get(["zoomOnBadge", "sidebarIcon"], function(settings)
			{
				// set icon
				opr.sidebarAction.setIcon({path : "../icons/" + settings.sidebarIcon + "19.png"});
				
				// deal with zoom change
				chrome.tabs.onZoomChange.addListener(function(zoomChangeInfo)
				{
					if (settings.zoomOnBadge === true)
					{
						var zoom = Math.round(zoomChangeInfo.newZoomFactor * 100);
						opr.sidebarAction.setBadgeText({text: zoom.toString()});
					}
				});
				
				// deal with tab change
				chrome.tabs.onActivated.addListener(function(activeInfo)
				{
					if (settings.zoomOnBadge === true)
					{
						chrome.tabs.getZoom(function(zoomFactor)
						{
							var zoom = Math.round(zoomFactor * 100);
							opr.sidebarAction.setBadgeText({text: zoom.toString()});
						});
					}
				});
				chrome.tabs.onUpdated.addListener(function(tab)
				{
					if (settings.zoomOnBadge === true)
					{
						chrome.tabs.getZoom(function(zoomFactor)
						{
							var zoom = Math.round(zoomFactor * 100);
							opr.sidebarAction.setBadgeText({text: zoom.toString()});
						});
					}
				});
				
				// deal with preferences change
				chrome.storage.onChanged.addListener(function(changes, areaName)
				{
					if (changes.zoomOnBadge)
					{
						settings.zoomOnBadge = changes.zoomOnBadge.newValue;
						if (changes.zoomOnBadge.newValue === true)
						{
							chrome.tabs.getZoom(function(zoomFactor)
							{
								var zoom = Math.round(zoomFactor * 100);
								opr.sidebarAction.setBadgeText({text: zoom.toString()});
							});
						}
						else
						{
							opr.sidebarAction.setBadgeText({text: ""});
						}
					}
				});
			});
		});
	});
}, false);