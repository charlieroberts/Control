function OSCManager() {
	this.delegate = this;
	return this;
}

OSCManager.prototype.processOSCMessage = function() {
	var address = arguments[0];
	var typetags = arguments[1];
	var args = [];
	
    switch(address){
        case "/control/runScript":
            eval(arguments[2]);
            return;
        break;
        case "/control/addWidget":
            eval("var w = " + arguments[2]);
            var _w = control.makeWidget(w);
            control.widgets.push(_w);
            eval("control.addWidget(" + w.name + ", control.currentPage);");
        return;
        break;
        case "/control/addWidgetPD":
            var w = {};
            for (var i = 2; i < arguments.length; i+=2)
            {
                w[arguments[i]]=arguments[i+1];
            }
            var _w = control.makeWidget(w);
            control.widgets.push(_w);
            eval("control.addWidget(" + w.name + ", control.currentPage);");
            return;
        break;
        case "/control/removeWidget":
            control.removeWidgetWithName(arguments[2]);
            return;
        break;
        case "/control/setBounds":
            var w = control.getWidgetWithName(arguments[2]);
            w.setBounds([arguments[3], arguments[4], arguments[5], arguments[6]]);
            return;
            break;
        case "/control/setColors":
            var w = control.getWidgetWithName(arguments[2]);
            w.setColors([arguments[3], arguments[4], arguments[5]]);
            return;
            break;
        case "/control/setRange":
            var w = control.getWidgetWithName(arguments[2]);
            w.setRange(arguments[3], arguments[4]);
            return;
            break;
        case "/control/setAddress":
            var w = control.getWidgetWithName(arguments[2]);
            w.address = arguments[3];
            return;
            break;
        case "/control/createBlankInterface":
            control.unloadWidgets();
            var _json = "loadedInterfaceName = '" + arguments[2] + "'; interfaceOrientation = '" + arguments[3] + "'; pages = [["
            if(typeof arguments[4] == "undefined" || arguments[4] == "true") {
                _json += '{\
                    "name": "menuButton",\
                    "type": "Button",\
                    "bounds": [.8,.8,.2,.1],\
                    "mode":"toggle",\
                    "colors": ["#000", "#444", "#aaa"],\
                    "ontouchstart": "if(this.value == this.max) { control.showToolbar();} else { control.hideToolbar(); }",\
                    "label": "menu",\
                },';
            }
            _json += "]];";
            
            interfaceManager.runInterface(_json);
            $.mobile.changePage('#SelectedInterfacePage');
            return;
            break;           
    }

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
					w.setValue(touchNumber + 1, args[0], args[1]); // need + 1 to 1 index the touches similar to output
				}
			}	
		}
	}
	for(var i = 0; i < control.widgets.length; i++) {
		var w = control.widgets[i];
		//console.log("w.address = " + w.address + " :: address received = " + oscAddress);
		if(w.address == oscAddress) {
			console.log("setting !" + args[0]);
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

