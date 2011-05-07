var Bonjour = function() {
	this.delegate = this;
	return this;
};

Bonjour.prototype.startup = function() {
	setTimeout(function() { PhoneGap.exec(null, null, 'Bonjour', 'start', []) }, 2500);
};

PhoneGap.addConstructor(function() {
	console.log("phonegap add bonjour constructor....");
	//Register the javascript plugin with PhoneGap
	PhoneGap.addPlugin('Bonjour', new Bonjour());
	
	//Register the native class of plugin with PhoneGap
	PluginManager.addService("Bonjour","com.charlieroberts.Control.Bonjour");
});