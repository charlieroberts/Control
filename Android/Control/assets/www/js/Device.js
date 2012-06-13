Control.device = {
    setRotation: function(orientation) {
		console.log("SETTING ORIENTATION "  + orientation);
        return PhoneGap.exec(null, null, "DeviceFeatures", "setRotation", [orientation]);
    },
    
    deviceProperties:function() {
        return PhoneGap.exec(null, null, "DeviceFeatures", "deviceProperties", []);
    },
    
    setAutolock : function(autolock) {
        PhoneGap.exec(null, null, "DeviceFeatures", "autolockToggle", [autolock]);
    },
};