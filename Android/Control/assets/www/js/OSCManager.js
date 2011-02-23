// TODO: Allow Canvas drawing instead of individual children... for large numbers of children this gets too slow.

function OSCManager(ctx, props) {
	this.delegate = this;
	
	return this;
}

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
					w.setValue(touchNumber, args[0], args[2]);
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
				w.setValue(touchNumber, args[0], args[1]);
			}
		}	
	}
}
OSCManager.prototype.setIPAddressAndPort = function() {
	
}