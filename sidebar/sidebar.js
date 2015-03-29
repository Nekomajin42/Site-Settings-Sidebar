// disable input fields on internal pages and the addon catalog
function disableFields(url)
{
	if (/addons.opera.com/.test(url) === true)
	{
		var disabled = true;
	}
	else
	{
		var protocol = url.slice(0, url.indexOf(":"));
		var disabled = (protocol === "opera" || protocol === "chrome" || protocol === "chrome-extension") ? true : false;
	}
	document.getElementById("zoom").disabled = disabled;
	var select = document.getElementsByTagName("select");
	for (var i=0; i<select.length; i++)
	{
		select[i].disabled = disabled;
	}
}

// deal with zoom
function getZoom()
{
	chrome.tabs.getZoom(function(zoomFactor)
	{
		var zoom = Math.floor(zoomFactor * 100);
		document.getElementById("zoom").value = zoom;
		if (settings.zoomOnBadge === true)
		{
			opr.sidebarAction.setBadgeText({text: zoom.toString()});
		}
	});
}
function setZoom()
{
	var zoom = document.getElementById("zoom").value;
	var zoomFactor = parseInt(zoom, 10) / 100;
	if (settings.zoomOnBadge === true)
	{
		opr.sidebarAction.setBadgeText({text: zoom});
	}
	chrome.tabs.setZoom(zoomFactor);
}

// deail with content settings
function getSettings()
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if (tabs.length === 1)
		{
			disableFields(tabs[0].url); // on internal pages
			var url = tabs[0].url;
			var types = ["cookies", "images", "javascript", "location", "plugins", "popups", "notifications", "fullscreen", "mouselock", "unsandboxedPlugins", "automaticDownloads", "camera", "microphone"];
			types.forEach(function(type)
			{
				chrome.contentSettings[type].get({primaryUrl: url}, function(details)
				{
					//console.log(type + ": " + details.setting);
					document.getElementById(type).value = details.setting;
				});
			});
		}
	});
}
function setSettings()
{
	var type = this.id;
	var value = this.value;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		var pattern = tabs[0].url.slice(0, tabs[0].url.indexOf("/", 8)) + "/*";
		chrome.contentSettings[type].set({primaryPattern: pattern, setting: value});
	});
}

// load local strings
function selectLocale()
{
	var elements = document.querySelectorAll("[data-i18n]");
	for (var i=0; i<elements.length; i++)
	{
		if (elements[i].tagName === "INPUT")
		{
			elements[i].value = chrome.i18n.getMessage(elements[i].dataset.i18n);
		}
		else
		{
			elements[i].innerHTML = chrome.i18n.getMessage(elements[i].dataset.i18n) + elements[i].innerHTML;
		}
	}
}

// to do on page load
var settings;
chrome.runtime.sendMessage("", function(response)
{
	// get user preferences
	settings = response;
	
	// load local strings
	selectLocale();
	
	// zoom
	getZoom();
	document.getElementById("zoom").addEventListener("change", setZoom, false);
	
	// settings
	getSettings();
	var types = document.getElementsByTagName("select");
	for (var i=0; i<types.length; i++)
	{
		types[i].addEventListener("change", setSettings, false);
	}
});

// to do on zoom change
chrome.tabs.onZoomChange.addListener(function(ZoomChangeInfo)
{
	//console.log(ZoomChangeInfo);
	getZoom();
});

// to do on page open/update
chrome.tabs.onActivated.addListener(function(activeInfo)
{
	getZoom();
	getSettings();
});
chrome.tabs.onUpdated.addListener(function(tab)
{
	getZoom();
	getSettings();
});