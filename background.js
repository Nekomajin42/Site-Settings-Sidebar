// do some stuff in install and update
chrome.runtime.onInstalled.addListener(function(details)
{
	if (details.reason === "install" || details.reason === "update")
	{
		// insert context menu items into sidebarAction
		chrome.contextMenus.create({type: "normal", id: "site_settings_sidebar.reset", contexts: ["sidebar_action"], title: chrome.i18n.getMessage("context_menu_reset")});
		chrome.contextMenus.create({type: "separator", id: "site_settings_sidebar.separator", contexts: ["sidebar_action"]});
		chrome.contextMenus.onClicked.addListener(function(info, tab)
		{
			if (info.menuItemId === "site_settings_sidebar.reset")
			{
				chrome.tabs.getZoomSettings(function(zoomSettings)
				{
					chrome.tabs.setZoom(zoomSettings.defaultZoomFactor);
				});
			}
		});
		
		// update sidebarAction
		getZoom(true);
		
		// throw notification
		var title = chrome.i18n.getMessage("notification_" + details.reason + "_title");
		var body = chrome.i18n.getMessage("notification_" + details.reason + "_body");
		var options = 
		{
			tag : "site_settings_sidebar", 
			dir : "auto",
			lang : window.navigator.language,
			icon : "icons/icon48.png", 
			body : body
		};
		var n = new Notification(title, options);
		n.onclick = function()
		{
			chrome.runtime.openOptionsPage();
		};
	}
});

// disable some stuff on pages where extensions are not allowed to run
function handleButton()
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if (tabs.length === 1)
		{
			var protocol = tabs[0].url.slice(0, tabs[0].url.indexOf(":"));
			if (/addons.opera.com/.test(tabs[0].url) === true)
			{ // Opera addon catalog
				chrome.contextMenus.update("site_settings_sidebar.reset", {enabled: false});
			}
			else if (protocol === "opera" || protocol === "chrome" || protocol === "browser" || protocol === "about" || protocol === "chrome-extension" || protocol === "chrome-devtools")
			{ // internal pages
				chrome.contextMenus.update("site_settings_sidebar.reset", {enabled: false});
			}
			else
			{
				chrome.contextMenus.update("site_settings_sidebar.reset", {enabled: true});
			}
		}
	});
}

// deal with sidebarAction
function getZoom(checkButton)
{
	// handle the button
	if (checkButton === true)
	{
		handleButton();
	}
	
	// update the badge IF necessary
	chrome.storage.local.get(["zoomOnBadge"], function(settings)
	{
		if (settings.zoomOnBadge === true)
		{
			chrome.tabs.getZoom(function(zoomFactor)
			{
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
				{
					if (tabs.length > 0) // chrome-devtools and chrome-extensions don't have tabs
					{
						var zoom = Math.round(zoomFactor * 100);
						opr.sidebarAction.setBadgeText({text: zoom.toString(), tabId: tabs[0].id});
					}
				});
			});
		}
	});
}

// to do on extension load
window.addEventListener("load", function()
{
	// build user preferences
	chrome.storage.local.get(null, function(saved)
	{
		chrome.storage.local.set(
		{
			autoRefresh : (saved.autoRefresh != undefined) ? saved.autoRefresh : true,
			zoomStep : (saved.zoomStep != undefined) ? saved.zoomStep : 10,
			safetyCode : (saved.safetyCode != undefined) ? saved.safetyCode : true,
			zoomOnBadge : (saved.zoomOnBadge != undefined) ? saved.zoomOnBadge : true,
			sidebarIcon : (saved.sidebarIcon != undefined) ? saved.sidebarIcon : "icon"
		});
	});
	
	// deal with zoom change
	chrome.tabs.onZoomChange.addListener(function(zoomChangeInfo)
	{
		getZoom(false);
	});
	
	// deal with tab change
	chrome.tabs.onActivated.addListener(function(activeInfo)
	{
		getZoom(true);
	});
	chrome.tabs.onUpdated.addListener(function(tab)
	{
		getZoom(true);
	});
	
	// deal with preferences change
	chrome.storage.onChanged.addListener(function(changes, areaName)
	{
		if (changes.sidebarIcon)
		{
			opr.sidebarAction.setIcon({path : "../icons/" + changes.sidebarIcon.newValue + "19.png"});
		}
		else if (changes.zoomOnBadge)
		{
			if (changes.zoomOnBadge.newValue === true)
			{
				getZoom(false);
			}
			else
			{
				opr.sidebarAction.setBadgeText({text: ""});
			}
		}
	});
}, false);