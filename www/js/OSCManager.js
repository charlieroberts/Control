function AutoGUI() {
    this.divisions = [
        {"bounds" : [0, 0, 1, .9], "widget" : null, "sacrosanct" : false},
        {"bounds" : [0,.9, 1, .1], "widget" : null, "sacrosanct" : true },
    ];
    return this;
}

function OSCManager() {
	this.delegate = this;
	return this;
}

AutoGUI.prototype.placeWidget = function(_widget) {
    var maxSize = 0;
    var bestDiv = -1;
    for(var i = 0; i < this.divisions.length; i++) {
        var div = this.divisions[i];
        if(div.sacrosanct) continue;
        if(div.bounds[2] + div.bounds[3] > maxSize) {
            maxSize = div.bounds[2] + div.bounds[3];
            bestDiv = i;
        }
    }
    
    console.log("Best div  = " + bestDiv);
    if(bestDiv != -1) {
        var selectedDiv = this.divisions[bestDiv];
        //selectedDiv.widgets.push(_widget);
        
        var splitDir = (selectedDiv.bounds[2] > selectedDiv.bounds[3]) ? 0 : 1;
        
        var widgetWidth, widgetHeight;
        if(selectedDiv.widget != null) {
            widgetWidth  = (splitDir == 0) ? selectedDiv.bounds[2] / 2 : selectedDiv.bounds[2];
            widgetHeight = (splitDir == 1) ? selectedDiv.bounds[3] / 2 : selectedDiv.bounds[3];
        }else{
            widgetWidth = selectedDiv.bounds[2];
            widgetHeight = selectedDiv.bounds[3];            
        }
        
        var w = (selectedDiv.widget == null) ? _widget : selectedDiv.widget;
        var div1 = {
            "bounds": [selectedDiv.bounds[0], selectedDiv.bounds[1], widgetWidth, widgetHeight],
            "widget": w,
            "sacrosanct": false,
        }
        
        if(selectedDiv.widget != null) {
            var newDivX = (splitDir == 0) ? selectedDiv.bounds[0] + widgetWidth  : selectedDiv.bounds[0];
            var newDivY = (splitDir == 1) ? selectedDiv.bounds[1] + widgetHeight : selectedDiv.bounds[1];
                
            var div2 = {
                "bounds": [newDivX, newDivY, widgetWidth, widgetHeight],
                "widget": _widget,
                "sacrosanct": false,
            }
        
            console.log("DIV 1 :::: " + div1.bounds);
            console.log("DIV 2 :::: " + div2.bounds);        
        
            this.divisions.splice( bestDiv, 1, div1, div2 );
            div1.widget.setBounds(div1.bounds);
            div2.widget.setBounds(div2.bounds); 
        }else{
            selectedDiv.widget = _widget;
            _widget.setBounds(div1.bounds);
        }
        
       
        // for(var i = 0; i < selectedDiv.widgets.length; i++) {
        //     var w = selectedDiv.widgets[i];
        //     var currentBounds = [];
        //     if(splitDir == 0) {
        //         currentBounds[0] = widgetWidth * i;
        //         currentBounds[1] = selectedDiv.bounds[1];              
        //     }else{
        //         currentBounds[0] = selectedDiv.bounds[0];
        //         currentBounds[1] = widgetHeight * i;
        //     }
        //     currentBounds[2] = widgetWidth;
        //     currentBounds[3] = widgetHeight;
        //     
        //     console.log(currentBounds);
        //     
        //     w.setBounds(currentBounds);
        // }
    }
}


OSCManager.prototype.processOSCMessage = function() {
	var address = arguments[0];
	var typetags = arguments[1];
	var args = [];
	console.log(address + "::"+typetags+"::"+arguments[2]);
    switch(address){
        case "/control/runScript":
            eval(arguments[2]);
            return;
        break;
        case "/control/addWidget":
            eval("var w = " + arguments[2]);
            var _w = control.makeWidget(w);
            control.widgets.push(_w);
            
            if(typeof _w.bounds == "undefined") {
                this.autogui.placeWidget(_w);
            }

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
            
        	this.autogui = new AutoGUI();
        	
            var _json = "loadedInterfaceName = '" + arguments[2] + "'; interfaceOrientation = '" + arguments[3] + "'; pages = [["
            if(typeof arguments[4] == "undefined" || arguments[4] == "true") {
                _json += '{\
                    "name": "menuButton",\
                    "type": "Button",\
                    "bounds": [.8,.9,.2,.1],\
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

