function PreferencesManager() {
	autolock = false;
	preferences = new Lawnchair('preferences');
		
	this.autolockToggle = function() {
		var autolockToggleLink = document.getElementById("autolockToggle");
		autolock = !autolock;
		(!autolock) ? autolockToggleLink.innerHTML = "Turn Autolock <b>Off</b>" : autolockToggleLink.innerHTML = "Turn Autolock <b>On</b>";			
		PhoneGap.exec("Device.autolockToggle", autolock);
		preferences.save({key:"autolock", shouldAutolock:autolock});
	}
	
	this.changePort = function(newPort) {
		console.log("changing port");
		PhoneGap.exec("OSCManager.setOSCReceivePort", parseInt(newPort));
		preferences.save({key:"OSCReceivePort", oscPort:parseInt(newPort) });
	}
	
	preferences.get("autolock", function(r){
					autolock = r.shouldAutolock;
					var autolockToggleLink = document.getElementById("autolockToggle");
					(!autolock) ? autolockToggleLink.innerHTML = "Turn Autolock <b>Off</b>" : autolockToggleLink.innerHTML = "Turn Autolock <b>On</b>";	
					PhoneGap.exec("Device.autolockToggle", autolock);
					setTimeout(function () { (!autolock) ? autolockToggleLink.innerHTML = "Turn Autolock <b>Off</b>" : autolockToggleLink.innerHTML = "Turn Autolock <b>On</b>"; }, 500);		
				});
	
	preferences.get("OSCReceivePort", function(r) {
					var oscport = r.oscPort;
					window.preferencesManager.changePort(oscport);
					setTimeout(function () { document.getElementById("oscForm").portField.value = oscport; }, 250);
				});
	return this;
}