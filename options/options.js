// stuff to do on page load
window.addEventListener("load", function()
{
	// select locale strings (control.js)
	selectLocale();
	
	// load and set settings
	var settings = JSON.parse(window.localStorage.siteSettingsSidebar);
	document.getElementById("colorCode").checked = settings.ui.colorCode;
	document.getElementById("autoRefresh").checked = settings.auto.refresh;
	document.getElementById("zoomOnBadge").checked = settings.zoom.onBadge;
	document.getElementById("zoomStep").value = settings.zoom.step;
	
	// make the menu work
	var menu = document.querySelectorAll("menu li");
	for (var i=0; i<menu.length; i++)
	{
		menu[i].addEventListener("click", toggleMenu, false);
	}
	
	// save user preferences
	document.getElementById("preferences").addEventListener("change", function()
	{
		settings.ui.colorCode = document.getElementById("colorCode").checked;
		settings.auto.refresh = document.getElementById("autoRefresh").checked;
		settings.zoom.onBadge = document.getElementById("zoomOnBadge").checked;
		settings.zoom.step = document.getElementById("zoomStep").value;
		window.localStorage.siteSettingsSidebar = JSON.stringify(settings);
	}, false);
}, false);
