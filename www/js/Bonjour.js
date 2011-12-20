window.Bonjour = {
    start: function() {
        console.log("BONJOUR START CALLED");
        return PhoneGap.exec(null, null, "Bonjour", "start", []);
    },

    getMyIP:function() {
        return PhoneGap.exec(null, null, "Bonjour", "getMyIP", []);
    },

    publishService:function(port, serviceName) {
        return PhoneGap.exec(null, null, "Bonjour", "publishService", [port, serviceName]);
    },

    browse:function() {
        return PhoneGap.exec(null, null, "Bonjour", "browse", []);
    },
};