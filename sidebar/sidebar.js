function disableFields(url)
{
	var protocol = url.slice(0, url.indexOf(":"));
	var disabled = (protocol === "opera" || protocol === "chrome") ? true : false;
	document.getElementById("zoom").disabled = disabled;
	var select = document.getElementsByTagName("select");
	for (var i=0; i<select.length; i++)
	{
		select[i].disabled = disabled;
	}
}

function getZoom()
{
	chrome.tabs.getZoom(function(zoomFactor)
	{
		var zoom = Math.floor(zoomFactor * 100);
		document.getElementById("zoom").value = zoom;
		opr.sidebarAction.setBadgeText({text: zoom.toString()});
	});
}

function setZoom()
{
	var zoom = document.getElementById("zoom").value;
	var zoomFactor = parseInt(zoom, 10) / 100;
	opr.sidebarAction.setBadgeText({text: zoom});
	chrome.tabs.setZoom(zoomFactor);
}

function getSettings()
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if (tabs.length === 1)
		{
			disableFields(tabs[0].url); // on internal pages
			var url = tabs[0].url;
			var types = ["cookies", "images", "javascript", "location", "plugins", "popups", "notifications", "cookies"];
			types.forEach(function(type)
			{
				chrome.contentSettings[type].get({primaryUrl: url}, function(details)
				{
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

document.addEventListener("DOMContentLoaded", function()
{
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
}, false);
chrome.tabs.onZoomChange.addListener(function(ZoomChangeInfo)
{
	//console.log(ZoomChangeInfo);
	document.getElementById("zoom").value = ZoomChangeInfo.newZoomFactor * 100;
});
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