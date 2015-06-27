// stuff to do on page load
window.addEventListener("load", function()
{
	// select locale strings (control.js)
	selectLocale();
	
	// load and set settings
	chrome.storage.local.get(null, function(settings)
	{
		document.getElementById("zoomStep").value = settings.zoomStep;
		document.getElementById("autoRefresh").checked = settings.autoRefresh;
		document.getElementById("greyScheme").checked = settings.greyScheme;
		document.getElementById("colorCode").checked = settings.colorCode;
		document.getElementById("zoomOnBadge").checked = settings.zoomOnBadge;
		document.getElementById("sidebarIcon").value = settings.sidebarIcon;
		opr.sidebarAction.setIcon({path : "../icons/" + settings.sidebarIcon + "19.png"});
	});
	
	// make the menu work
	var menu = document.querySelectorAll("menu li");
	for (var i=0; i<menu.length; i++)
	{
		menu[i].addEventListener("click", toggleMenu, false);
	}
	
	// save user preferences
	document.querySelector("div#settings").addEventListener("change", function()
	{
		chrome.storage.local.set(
		{
			autoRefresh : document.getElementById("autoRefresh").checked,
			zoomStep : document.getElementById("zoomStep").value,
			colorCode : document.getElementById("colorCode").checked,
			greyScheme : document.getElementById("greyScheme").checked,
			zoomOnBadge : document.getElementById("zoomOnBadge").checked,
			sidebarIcon : document.getElementById("sidebarIcon").value
		}, function()
		{
			opr.sidebarAction.setIcon({path : "../icons/" + document.getElementById('sidebarIcon').value + "19.png"});
		});
	}, false);
	
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
}, false);
