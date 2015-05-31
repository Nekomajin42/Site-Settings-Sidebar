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
		var disabled = (protocol === "browser" || protocol === "opera" || protocol === "chrome" || protocol === "chrome-extension") ? true : false;
	}
	document.getElementById("zoom").disabled = disabled;
	document.getElementById("resetZoom").disabled = disabled;
	document.getElementById("resetTurbo").disabled = disabled;
	var select = document.getElementsByTagName("select");
	for (var i=0; i<select.length; i++)
	{
		select[i].disabled = disabled;
	}
	
	// footer icon
	document.querySelector("footer label").className = (settings.colorCode === true) ? ((disabled === true) ? "yellow" : "green") : "transparent";
}

// deal with zoom
function getZoom()
{
	chrome.tabs.getZoom(function(zoomFactor)
	{
		var zoom = Math.round(zoomFactor * 100);
		document.getElementById("zoom").value = zoom;
		opr.sidebarAction.setBadgeText({text: (settings.zoomOnBadge === true) ? zoom.toString() : ""});
		chrome.tabs.getZoomSettings(function(zoomSettings)
		{
			document.querySelector("label[for='zoom']").className = (settings.colorCode === true) ? ((zoomFactor === zoomSettings.defaultZoomFactor) ? "green" : "yellow") : "transparent";
		});
	});
}
function setZoom()
{
	var zoom = document.getElementById("zoom").value;
	var zoomFactor = parseInt(zoom, 10) / 100;
	opr.sidebarAction.setBadgeText({text: (settings.zoomOnBadge === true) ? zoom : ""});
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
			disableFields(tabs[0].url); // on internal pages
			var url = tabs[0].url;
			var types = ["cookies", "images", "javascript", "location", "plugins", "popups", "notifications", "fullscreen", "mouselock", "unsandboxedPlugins", "automaticDownloads", "camera", "microphone"];
			types.forEach(function(type)
			{
				try
				{
					chrome.contentSettings[type].get({primaryUrl: url}, function(details)
					{
						//console.log(type + ": " + details.setting);
						document.getElementById(type).value = details.setting;
						document.querySelector("label[for='"+type+"']").className = (settings.colorCode === true) ? document.querySelector("#"+type+" option[value='"+details.setting+"']").dataset.color : "transparent";
					});
				}
				catch (error)
				{
					document.getElementById(type).disabled = true;
					document.querySelector("label[for='"+type+"']").className = (settings.colorCode === true) ? "grey" : "transparent";
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
		if (settings.autoRefresh === true)
		{
			chrome.tabs.reload();
		}
	});
}

// deal with global tools
function getTools()
{
	// Turbo
	opr.offroad.enabled.get({}, function(details)
	{
		if (details.levelOfControl === "controllable_by_this_extension" || details.levelOfControl === "controlled_by_this_extension")
		{
			document.getElementById("turbo").value = details.value;
			document.querySelector("label[for='turbo']").className = (settings.colorCode === true) ? ((details.value === true) ? "yellow" : "green") : "transparent";
		}
	});
}
function setTools()
{
	var type = this.id;
	var value = this.value;
	if (type === "turbo")
	{
		opr.offroad.enabled.set({value: (value === "true"), scope: "regular"}, function(details)
		{
			if (settings.autoRefresh === true)
			{
				chrome.tabs.reload();
			}
		});
	}
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
		else if (elements[i].tagName != "LABEL")
		{
			elements[i].innerHTML = chrome.i18n.getMessage(elements[i].dataset.i18n) + elements[i].innerHTML;
		}
	}
}

// create and remove Help tooltip
function showTooltip(e)
{
	var target = (e.target.tagName === "LABEL") ? e.target : e.target.parentNode;
	var text = chrome.i18n.getMessage(target.dataset.i18n).split("|");
	var div = document.createElement("div");
	div.id = "tooltip";
	div.innerHTML = "<strong>" + text[0] + "</strong><br />";
	div.innerHTML += text[1];
	div.innerHTML += (text[2] != undefined) ? "<br /><em>" + text[2] + "</em>" : "";
	if (/footer/.test(target.dataset.i18n) === true)
	{
		div.className = "up";
		div.style.bottom = "31px";
	}
	else if (/permission/.test(target.dataset.i18n) === true || /tools/.test(target.dataset.i18n) === true)
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
	document.body.removeChild(document.getElementById("tooltip"));
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
		
		// zoom
		document.getElementById("zoom").step = settings.zoomStep;
		
		// colos scheme
		document.body.classList.add((settings.greyScheme === true) ? "gray" : "colorful");
		
		// form mode
		document.body.classList.add("view");
		
		// zoom
		getZoom();
		document.getElementById("zoom").addEventListener("change", setZoom, false);
		document.getElementById("resetZoom").addEventListener("click", resetZoom, false);
		
		// content settings
		getSettings();
		var types = document.getElementsByClassName("content_setting");
		for (var i=0; i<types.length; i++)
		{
			types[i].addEventListener("change", setSettings, false);
		}
		
		// global tools
		getTools();
		var types = document.getElementsByClassName("global_setting");
		for (var i=0; i<types.length; i++)
		{
			types[i].addEventListener("change", setTools, false);
		}
		document.getElementById("resetTurbo").addEventListener("click", function()
		{
			opr.offroad.enabled.clear({scope: "regular"});
		});
	});
	
	// inject Help tooltip
	var labels = document.querySelectorAll("label");
	for (var i=0; i<labels.length; i++)
	{
		labels[i].addEventListener("mouseover", showTooltip, false);
		labels[i].addEventListener("mouseout", hideTooltip, false);
	}
}, false);

// to do on zoom change
chrome.tabs.onZoomChange.addListener(function(zoomChangeInfo)
{
	getZoom();
});

// to do on Turbo change
opr.offroad.enabled.onChange.addListener(function(event)
{
	getTools();
});

// to do on page open/update
chrome.tabs.onActivated.addListener(function(activeInfo)
{
	getZoom();
	getSettings();
	getTools();
});
chrome.tabs.onUpdated.addListener(function(tab)
{
	getZoom();
	getSettings();
	getTools();
});

// toggle edit/view mode
opr.sidebarAction.onFocus.addListener(function(tabs)
{
	document.body.classList.remove("view");
	document.body.classList.add("edit");
	document.getElementById("zoom").focus();
});
opr.sidebarAction.onBlur.addListener(function(tabs)
{
	document.body.classList.remove("edit");
	document.body.classList.add("view");
});

// to do on user preferences change
chrome.storage.onChanged.addListener(function(changes, areaName)
{
	if (changes.zoomOnBadge)
	{
		opr.sidebarAction.setBadgeText({text: (changes.zoomOnBadge.newValue === true) ? document.getElementById("zoom").value : ""});
	}
	else if (changes.greyScheme || changes.colorCode)
	{
		location.reload();
	}
	else if (changes.zoomStep)
	{
		document.getElementById("zoom").step = changes.zoomStep.newValue;
	}
	else if (changes.zoomStep || changes.autoRefresh)
	{
		settings.autoRefresh = changes.autoRefresh.newValue;
	}
});
