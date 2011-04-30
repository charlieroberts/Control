var OSCManager = function() {
	this.delegate = this;
	
	return this;
}

OSCManager.prototype.send = function(msg, successCallback, failureCallback) {

    return PhoneGap.exec(successCallback,   //Callback which will be called when directory listing is successful
    					failureCallback,    //Callback which will be called when directory listing encounters an error
    					'OSCManager',  		//Telling PhoneGap that we want to run "OSC" Plugin
    					'send',             //Telling the plugin, which action we want to perform
    					msg);        		//Passing a list of arguments to the plugin, in this case this is the directory path
};

/**
 * <ul>
 * <li>Register the Directory Listing Javascript plugin.</li>
 * <li>Also register native call which will be called when this plugin runs</li>
 * </ul>
 */
PhoneGap.addConstructor(function() {
	console.log("phonegap add constructor....");
	//Register the javascript plugin with PhoneGap
	PhoneGap.addPlugin('OSCManager', new OSCManager());
	
	//Register the native class of plugin with PhoneGap
	PluginManager.addService("OSCManager","com.charlieroberts.Control.OSCManager");
});

OSCManager.prototype.processOSCMessage = function() {
	var address = arguments[0];
	var typetags = arguments[1];
	var args = [];
	
	//debug.log(address + " : : " + typetags);
	for(var i = 2; i < arguments.length; i++) {
		args[i - 2] = arguments[i];
	}
	
	this.delegate.processOSC(address, typetags, args);
}	

OSCManager.prototype.processOSC = function(oscAddress, typetags, args) {
	if(typeof control.constants != "undefined") {
		for(var i = 0; i < control.constants.length; i++) {
			var w = control.constants[i];
			if(w.address == oscAddress) {
				w.setValue(args[0], false);
				break;
			}else{
				if(w.widgetType == "MultiButton" || w.widgetType == "MultiSlider") { // TODO: optimize so that it looks at address - last digit instead of automatically looping through everything
					for(var j = 0; j < w.children.length; j++) {
						var child = w.children[j];
						if(child.address == oscAddress) {
							child.setValue(args[0], false);
							return;
						}
					}
				}else if(w.widgetType == "MultiTouchXY") {
					var addressSplit = oscAddress.split('/');
					var touchNumber =  addressSplit.pop();
					w.setValue(touchNumber + 1, args[0], args[2]); // need + 1 to 1 index the touches similar to output
				}
			}	
		}
	}
	for(var i = 0; i < control.widgets.length; i++) {
		var w = control.widgets[i];
		debug.log("w.address = " + w.address + " :: address received = " + oscAddress);
		if(w.address == oscAddress) {
			debug.log("setting !" + args[0]);
			w.setValue(args[0], false);
			break;
		}else{
			if(w.widgetType == "MultiButton" || w.widgetType == "MultiSlider") { // TODO: optimize so that it looks at address - last digit
				for(var j = 0; j < w.children.length; j++) {
					var child = w.children[j];
					if(child.address == oscAddress) {
						child.setValue(args[0], false);
						return;
					}
				}
			}else if(w.widgetType == "MultiTouchXY") {
				// TODO: multitouch setting
				var addressSplit = oscAddress.split('/');
				var touchNumber =  addressSplit.pop();
				w.setValue(touchNumber, args[0], args[1]); // need + 1 to 1 index the touches similar to output
			}
		}	
	}
}

OSCManager.prototype.sendOSC = function() {	// NOTE: PhoneGap.exec('OSCManager.send') will be much more efficient than this for a large number of strings.
	if(_protocol == "OSC") {
		var address = arguments[0];
		var typetags = arguments[1];
		var evalString = "PhoneGap.exec('OSCManager.send', '"+address+"','"+typetags+"',";
		for(var i = 0; i < typetags.length; i++) {
			var arg = arguments[i + 2];
			if(typetags.charAt(i) != 's') 
				evalString += arg;
			else
				evalString += "'" + arg + "'";
				
			if(i != typetags.length - 1) 
				evalString += ",";
			else
				evalString += ");"
		}
		eval(evalString);
	}
}