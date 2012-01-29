function PreferencesManager() {
	autolock = false;
	preferences = new Lawnchair('preferences');
    this.oscport = 8080;
    
	this.autolockToggle = function() {
        console.log("LOCKING");
		var autolockToggleLink = document.getElementById("autolockToggle");
		autolock = !autolock;
		(!autolock) ? autolockToggleLink.innerHTML = "Turn Autolock <b>Off</b>" : autolockToggleLink.innerHTML = "Turn Autolock <b>On</b>";			
		PhoneGap.exec("Device.autolockToggle", autolock);
		preferences.save({key:"autolock", shouldAutolock:autolock});
	}
	
	this.changePort = function(newPort) {
		console.log("changing port");
		PhoneGap.exec("OSCManager.setOSCReceivePort", parseInt(newPort));
        this.oscport = parseInt(newPort);
		preferences.save({key:"OSCReceivePort", oscPort:parseInt(newPort) });
	}
	
	preferences.get("autolock", function(r){
					autolock = r.shouldAutolock;
					var autolockToggleLink = document.getElementById("autolockToggle");
					(!autolock) ? autolockToggleLink.innerHTML = "Turn Autolock <b>Off</b>" : autolockToggleLink.innerHTML = "Turn Autolock <b>On</b>";	
					PhoneGap.exec("Device.autolockToggle", autolock);
					setTimeout(function () { 
                               if(!autolock)
                                    $("#autolockToggle").innerHTML = "Turn Autolock <b>Off</b>";
                               else
                                    $("#autolockToggle").innerHTML = "Turn Autolock <b>On</b>";
                               }, 500);		
				});
	
	preferences.get("OSCReceivePort", function(r) {
					var oscport;
                    if(typeof r.oscPort == "undefined")
                        oscport = 8080;
                    else
                        oscport = r.oscPort;
                    
					window.preferencesManager.changePort(oscport);
					setTimeout(function () { 
                               this.oscport = oscport;
                               console.log("setting preference text");
                           //PhoneGap.exec("OSCManager.setOSCReceivePort", parseInt(oscport));
                               $('#portField').val(this.oscport); }, 250);
				});

    window.oscport = this.oscport;
    setTimeout(function() { PhoneGap.exec("OSCManager.setOSCReceivePort", parseInt(window.oscport)); }, 500);
	return this;
}