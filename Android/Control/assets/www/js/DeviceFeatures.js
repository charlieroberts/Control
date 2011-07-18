var DeviceFeatures = function() {
	return this;
};

DeviceFeatures.prototype.startup = function() {
	setTimeout(function() { PhoneGap.exec(null, null, 'Bonjour', 'start', []) }, 2500);
};

PhoneGap.addConstructor(function() {
	//Register the javascript plugin with PhoneGap
    PhoneGap.addPlugin('DeviceFeatures', new DeviceFeatures());
	
	//Register the native class of plugin with PhoneGap
    PluginManager.addService("DeviceFeatures","com.charlieroberts.Control.DeviceFeatures");
});