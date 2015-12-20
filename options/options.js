// stuff to do on page load
window.addEventListener("load", function()
{
	// load subpage from URL hash
	var hash = (location.hash) ? location.hash : "#settings";
	document.querySelector(hash).classList.add("visible");
	document.querySelector(hash + "-nav").classList.add("selected");

	// load local language
	var elements = document.querySelectorAll("[data-i18n]");
	for (var i = 0; i < elements.length; i++)
	{
		elements[i].innerHTML = chrome.i18n.getMessage(elements[i].dataset.i18n) + elements[i].innerHTML;
	}
	
	// make the menu work
	var subpages = document.querySelectorAll("article");
	var menuitems = document.querySelectorAll("nav ul li a");
	for (var i=0; i<menuitems.length; i++)
	{
		menuitems[i].addEventListener("click", function(e)
		{
			e.preventDefault();
			for (j=0; j<menuitems.length; j++)
			{
				if (this.id == menuitems[j].id)
				{
					subpages[j].classList.add("visible");
					menuitems[j].classList.add("selected");
				}
				else
				{
					subpages[j].classList.remove("visible");
					menuitems[j].classList.remove("selected");
				}
			}
		}, false);
	}
	
	// inject Extensions and KeyConfig page links
	document.getElementById("ext").addEventListener("click", function(e)
	{
		e.preventDefault();
		chrome.tabs.create({url: "opera://extensions/?id=" + chrome.runtime.id});
	}, false);
	document.getElementById("keys").addEventListener("click", function(e)
	{
		e.preventDefault();
		chrome.tabs.create({url: "opera://settings/configureCommands"});
	}, false);
	
	// load and set settings
	chrome.storage.local.get(null, function(settings)
	{
		document.getElementById("zoomStep").value = settings.zoomStep;
		document.getElementById("autoRefresh").checked = settings.autoRefresh;
		document.getElementById("safetyCode").checked = settings.safetyCode;
		document.getElementById("zoomOnBadge").checked = settings.zoomOnBadge;
		document.getElementById("sidebarIcon").value = settings.sidebarIcon;
		opr.sidebarAction.setIcon({path : "../icons/" + settings.sidebarIcon + "19.png"});
	});
	
	// save user preferences
	document.querySelector("article#settings").addEventListener("change", function()
	{
		chrome.storage.local.set(
		{
			autoRefresh : document.getElementById("autoRefresh").checked,
			zoomStep : document.getElementById("zoomStep").value,
			safetyCode : document.getElementById("safetyCode").checked,
			zoomOnBadge : document.getElementById("zoomOnBadge").checked,
			sidebarIcon : document.getElementById("sidebarIcon").value
		}, function()
		{
			opr.sidebarAction.setIcon({path : "../icons/" + document.getElementById('sidebarIcon').value + "19.png"});
		});
	}, false);
}, false);
