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
	document.getElementById("resetZoom").disabled = disabled;
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
		var zoom = Math.round(zoomFactor * 100);
		document.getElementById("zoom").value = zoom;
		if (settings.zoom.onBadge === true) // do we need the badge?
		{
			opr.sidebarAction.setBadgeText({text: zoom.toString()});
		}
		document.querySelector("label[for='zoom']").style.borderColor = (settings.ui.colorCode === true) ? ((zoomFactor === 1) ? "Green" : "Yellow") : "White";
	});
}
function setZoom()
{
	var zoom = document.getElementById("zoom").value;
	var zoomFactor = parseInt(zoom, 10) / 100;
	if (settings.zoom.onBadge === true)
	{
		opr.sidebarAction.setBadgeText({text: zoom});
	}
	chrome.tabs.setZoom(zoomFactor);
}
function resetZoom()
{
	/*chrome.tabs.getZoomSettings(function(ZoomSettings)
	{
		console.log(ZoomSettings);
	});*/
	document.getElementById("zoom").value = 100;
	setZoom();
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
						document.querySelector("label[for='"+type+"']").style.borderColor = (settings.ui.colorCode === true) ? document.querySelector("#"+type+" option[value='"+details.setting+"']").dataset.color : "White";
					});
				}
				catch (error)
				{
					document.getElementById(type).disabled = true;
					document.querySelector("label[for='"+type+"']").style.borderColor = (settings.ui.colorCode === true) ? "Grey" : "White";
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
		if (settings.auto.refresh === true)
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
		else
		{
			elements[i].innerHTML = chrome.i18n.getMessage(elements[i].dataset.i18n) + elements[i].innerHTML;
		}
	}
}

// create and remove Help tooltip
function showTooltip(e)
{
	var text = chrome.i18n.getMessage(e.target.dataset.i18n).split("|");
	var div = document.createElement("div");
	div.id = "tooltip";
	div.innerHTML = "<strong>" + text[0] + "</strong><br />";
	div.innerHTML += text[1];
	div.innerHTML += (text[2] != undefined) ? "<br /><em>" + text[2] + "</em>" : "";
	div.style.top = e.target.offsetTop + 25 + "px";
	document.body.appendChild(div);
}
function hideTooltip()
{
	document.body.removeChild(document.getElementById("tooltip"));
}

// to do on page load
var settings;
chrome.runtime.sendMessage("", function(response)
{
	// get and set user preferences
	settings = response;
	document.getElementById("zoom").step = settings.zoom.step;
	
	// load local strings, set display mode
	selectLocale();
	document.body.className = "view";
	
	// zoom
	getZoom();
	document.getElementById("zoom").addEventListener("change", setZoom, false);
	document.getElementById("resetZoom").addEventListener("click", resetZoom, false);
	
	// settings
	getSettings();
	var types = document.getElementsByTagName("select");
	for (var i=0; i<types.length; i++)
	{
		types[i].addEventListener("change", setSettings, false);
	}
	
	// inject Help tooltip
	var labels = document.querySelectorAll("label img");
	for (var i=0; i<labels.length; i++)
	{
		labels[i].addEventListener("mouseover", showTooltip, false);
		labels[i].addEventListener("mouseout", hideTooltip, false);
	}
	
	// Extensions page link
	document.getElementById("ext").addEventListener("click", function()
	{
		chrome.tabs.create({url: "opera://extensions/?id=" + chrome.runtime.id});
	}, false);
});

// to do on zoom change
chrome.tabs.onZoomChange.addListener(function(ZoomChangeInfo)
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

// toggle edit/view mode
opr.sidebarAction.onFocus.addListener(function(tabs)
{
	document.body.className = "edit";
	document.getElementById("zoom").focus();
});

opr.sidebarAction.onBlur.addListener(function(tabs)
{
	document.body.className = "view";
});