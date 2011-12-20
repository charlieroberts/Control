window.Rotator = {
    setRotation: function(orientation) {
        return PhoneGap.exec(null, null, "Device", "setRotation", [orientation]);
    },
    
    deviceProperties:function() {
        return PhoneGap.exec(null, null, "Device", "deviceProperties", []);
    },
};    