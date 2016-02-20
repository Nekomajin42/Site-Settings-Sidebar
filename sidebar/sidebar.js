// disable input fields on internal pages and the addon catalog
function disableFields(url)
{
	if (/addons.opera.com/.test(url) === true) // Opera addon catalog
	{
		var disabled = true;
	}
	else // internal pages
	{
		var protocol = url.slice(0, url.indexOf(":"));
		var disabled = (protocol === "browser" || protocol === "opera" || protocol === "chrome" || protocol === "about" || protocol === "chrome-extension" || protocol === "chrome-devtools") ? true : false;
	}
	
	// disable form fields
	var fieldset = document.getElementsByTagName("fieldset");
	for (var i=0; i<fieldset.length; i++)
	{
		fieldset[i].disabled = disabled;
	}
	
	// handle footer icon
	document.querySelector("footer span").className = (settings.safetyCode === true) ? ((disabled === true) ? "neutral" : "safe") : "none";
}

// deal with zoom
function getZoom()
{
	chrome.tabs.getZoom(function(zoomFactor)
	{
		var zoom = Math.round(zoomFactor * 100);
		document.getElementById("zoom").value = zoom;
		chrome.tabs.getZoomSettings(function(zoomSettings)
		{
			document.querySelector("label[for='zoom']").className = (settings.safetyCode === true) ? ((zoomFactor === zoomSettings.defaultZoomFactor) ? "safe" : "neutral") : "none";
		});
	});
}
function setZoom()
{
	var zoom = document.getElementById("zoom").value;
	var zoomFactor = parseInt(zoom, 10) / 100;
	chrome.tabs.setZoom(zoomFactor);
}
function resetZoom()
{
	chrome.tabs.getZoomSettings(function(zoomSettings)
	{
		document.getElementById("zoom").value = zoomSettings.defaultZoomFactor*100;
		setZoom();
	});
}

// deail with content settings
function getSettings()
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if (tabs.length === 1)
		{
			var url = tabs[0].url; // get the current URL
			disableFields(url); // on internal pages and addon catalog
			var types = ["cookies", "images", "javascript", "location", "plugins", "popups", "notifications", "fullscreen", "mouselock", "unsandboxedPlugins", "automaticDownloads", "camera", "microphone"];
			types.forEach(function(type)
			{
				try // change content setting
				{
					chrome.contentSettings[type].get({primaryUrl: url}, function(details)
					{
						document.getElementById(type).value = details.setting;
						document.querySelector("label[for='"+type+"']").className = (settings.safetyCode === true) ? document.querySelector("#"+type+" option[value='"+details.setting+"']").dataset.safety : "none";
					});
				}
				catch (error) // disable the connecting field
				{
					console.log("contentSettings ("+type+") is not supported.");
					document.getElementById(type).disabled = true;
					document.querySelector("label[for='"+type+"']").className = (settings.safetyCode === true) ? "unknown" : "none";
				}
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
		
		// reload tab
		if (settings.autoRefresh === true)
		{
			chrome.tabs.reload();
		}
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
		else if (elements[i].tagName != "LABEL" && elements[i].tagName != "SPAN")
		{
			text = document.createTextNode(chrome.i18n.getMessage(elements[i].dataset.i18n));
			elements[i].insertBefore(text, elements[i].firstChild);
		}
	}
}

// create and remove Help tooltip
function showTooltip(e)
{
	// find target
	if (e.target.tagName === "LABEL" || e.target.tagName === "SPAN")
	{
		var target = e.target;
	}
	else if (e.target.tagName == "IMG")
	{
		var target = e.target.parentNode;
	}
	else
	{
		return false;
	}
	
	// parse content
	var text = chrome.i18n.getMessage(target.dataset.i18n).split("|");
	
	// create box
	var div = document.createElement("div");
	div.id = "tooltip";
	div.innerHTML = "<strong>" + text[0] + "</strong><br />";
	div.innerHTML += text[1];
	div.innerHTML += (text[2] != undefined) ? "<br /><em>" + text[2] + "</em>" : "";
	if (/footer/.test(target.dataset.i18n) === true) // bubble up or down
	{
		div.className = "up";
		div.style.bottom = "33px";
	}
	else if (/permission/.test(target.dataset.i18n) === true)
	{
		div.className = "up";
		div.style.bottom = document.body.clientHeight - target.offsetTop + 5 + "px";
	}
	else
	{
		div.className = "down";
		div.style.top = target.offsetTop + 29 + "px";
	}
	document.body.appendChild(div);
}
function hideTooltip()
{
	var tooltip = document.getElementById("tooltip");
	if (document.body.contains(tooltip))
	{
		document.body.removeChild(tooltip);
	}
}

// to do on page load
var settings;
window.addEventListener("load", function()
{
	// get and set user preferences
	chrome.storage.local.get(null, function(pref)
	{
		// pass settings
		settings =  pref;
		
		// localization
		selectLocale();
		
		// zoom step
		document.getElementById("zoom").step = settings.zoomStep;
		
		// zoom
		getZoom();
		document.getElementById("zoom").addEventListener("change", setZoom, false);
		document.getElementById("resetZoom").addEventListener("click", resetZoom, false);
		
		// content settings
		getSettings();
		var types = document.getElementsByTagName("select");
		for (var i=0; i<types.length; i++)
		{
			types[i].addEventListener("change", setSettings, false);
		}
	});
	
	// inject Help tooltip
	var labels = document.querySelectorAll("label");
	for (var i=0; i<labels.length; i++)
	{
		labels[i].addEventListener("click", showTooltip, false);
		labels[i].addEventListener("mouseout", hideTooltip, false);
	}
	document.querySelector("footer span").addEventListener("click", showTooltip, false);
	document.querySelector("footer span").addEventListener("mouseout", hideTooltip, false);
}, false);

// to do on zoom change
chrome.tabs.onZoomChange.addListener(function(zoomChangeInfo)
{
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

// to do on user preferences change
chrome.storage.onChanged.addListener(function(changes, areaName)
{
	if (changes.zoomOnBadge)
	{
		opr.sidebarAction.setBadgeText({text: (changes.zoomOnBadge.newValue === true) ? document.getElementById("zoom").value : ""});
		location.reload();
	}
	else if (changes.safetyCode)
	{
		location.reload();
	}
	else if (changes.zoomStep)
	{
		document.getElementById("zoom").step = changes.zoomStep.newValue;
	}
	else if (changes.autoRefresh)
	{
		settings.autoRefresh = changes.autoRefresh.newValue;
	}
});
