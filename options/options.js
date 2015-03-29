// stuff to do on page load
window.addEventListener("load", function()
{
	// select locale strings (control.js)
	selectLocale();
	
	// load and set settings
	var settings = JSON.parse(window.localStorage.siteSettingsSidebar);
	document.getElementById("zoomOnBadge").checked = settings.zoomOnBadge;
	
	// make the menu work
	var menu = document.querySelectorAll("menu li");
	for (var i=0; i<menu.length; i++)
	{
		menu[i].addEventListener("click", toggleMenu, false);
	}
	
	// save user preferences
	document.getElementById("zoomOnBadge").addEventListener("change", function()
	{
		settings.zoomOnBadge = document.getElementById("zoomOnBadge").checked;
		window.localStorage.siteSettingsSidebar = JSON.stringify(settings);
	}, false);
}, false);
