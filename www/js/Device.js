Control.device = {
    setRotation: function(orientation) {
        return PhoneGap.exec(null, null, "Device", "setRotation", [orientation]);
    },
    
    deviceProperties:function() {
        return PhoneGap.exec(null, null, "Device", "deviceProperties", []);
    },
    
    setAutolock : function(autolock) {
        PhoneGap.exec(null, null, "Device", "autolockToggle", [autolock]);
    },
};