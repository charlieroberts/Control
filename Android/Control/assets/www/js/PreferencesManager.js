function PreferencesManager() {
    autolock = false;
    preferences = new Lawnchair('preferences');
    this.oscport = 8080;

    this.autolockToggle = function() {
        console.log("LOCKING");
        var autolockToggleLink = document.getElementById("autolockToggle");
        autolock = !autolock;
        (!autolock) ? autolockToggleLink.innerHTML = "Turn Autolock <b>Off</b>": autolockToggleLink.innerHTML = "Turn Autolock <b>On</b>";
        PhoneGap.exec(null, null, "Device", "autolockToggle", [autolock]);
        preferences.save({
            key: "autolock",
            shouldAutolock: autolock
        });
    }

    this.changePort = function(newPort) {
        console.log("changing port");
        PhoneGap.exec(null, null, "OSCManager", "setOSCReceivePort", [parseInt(newPort)]);
        this.oscport = parseInt(newPort);
        preferences.save({
            key: "OSCReceivePort",
            oscPort: parseInt(newPort)
        });
    }

    preferences.get("autolock",
    function(r) {
        if(typeof r != "undefined" && r != null) {
            autolock = r.shouldAutolock;
        }else{
            autolock = true;
        }
        var autolockToggleLink = document.getElementById("autolockToggle");
        (!autolock) ? autolockToggleLink.innerHTML = "Turn Autolock <b>Off</b>": autolockToggleLink.innerHTML = "Turn Autolock <b>On</b>";
        PhoneGap.exec(null, null, "Device", "autolockToggle", [autolock]);
        setTimeout(function() {
            if (!autolock)
            $("#autolockToggle").innerHTML = "Turn Autolock <b>Off</b>";
            else
            $("#autolockToggle").innerHTML = "Turn Autolock <b>On</b>";
        },
        500);    
    });

    preferences.get("OSCReceivePort",
       function(r) {
           var oscport;                    
           oscport = 8080;
           shouldChange = false;
           if (typeof r == "undefined" && r != null) {
               if(typeof r.oscPort != "undefined") {
                   if(r.oscPort != oscport) {
                       oscport = r.oscPort;
                       shouldChange = true;
                   }
               }
           }
           if(shouldChange) {
               window.preferencesManager.changePort(oscport);

               this.oscport = oscport;
               console.log("setting preference text");
               //PhoneGap.exec("OSCManager.setOSCReceivePort", parseInt(oscport));
               $('#portField').val(this.oscport);
            }
       }
    );
    
    // window.oscport = this.oscport;
    // setTimeout(function() {
    //     PhoneGap.exec(null, null, "OSCManager", "setOSCReceivePort", [parseInt(window.oscport)]);
    // },
    // 500);
    return this;
}