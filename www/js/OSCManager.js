function AutoGUI() {
    this.divisions = [
        {"bounds" : [0, 0, 1, .9], "widget" : null, "sacrosanct" : false},
        {"bounds" : [0,.9, 1, .1], "widget" : null, "sacrosanct" : true },
    ];
    return this;
}

AutoGUI.prototype.placeWidget = function(_widget, sacrosanct) {
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
    
    if(bestDiv != -1) {
        var selectedDiv = this.divisions[bestDiv];
        
        var splitDir = (selectedDiv.bounds[2] > selectedDiv.bounds[3]) ? 0 : 1; // will the cell be split horizontally or vertically?
        
        var widgetWidth, widgetHeight;
        if(selectedDiv.widget != null) {    // this will only be null on the very first widget addition
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
            "sacrosanct": sacrosanct,
        }
        
        if(selectedDiv.widget != null) {
            var newDivX = (splitDir == 0) ? selectedDiv.bounds[0] + widgetWidth  : selectedDiv.bounds[0];
            var newDivY = (splitDir == 1) ? selectedDiv.bounds[1] + widgetHeight : selectedDiv.bounds[1];
                
            var div2 = {
                "bounds": [newDivX, newDivY, widgetWidth, widgetHeight],
                "widget": _widget,
                "sacrosanct": selectedDiv.sacrosanct,
            }      
        
            this.divisions.splice( bestDiv, 1, div1, div2 );
            div1.widget.setBounds(div1.bounds);
            div2.widget.setBounds(div2.bounds); 
        }else{
            selectedDiv.widget = _widget;
            _widget.setBounds(div1.bounds);
        }
    }
};

window.oscManager = {
	delegate: this,
	processOSCMessage : function() {
		var address = arguments[0];
		
		if(typeof this.callbacks[address] != "undefined") {	// if Control has a defined callback for this address ...
			this.callbacks[address](arguments);				// ... call the function associated with it ...
		}else{                                              // ... else call processOSC on the oscManager delegate
			var args = [];

			for(var i = 2; i < arguments.length; i++) {
				args[i - 2] = arguments[i];
			}

			this.delegate.processOSC(address, typetags, args);
		}
	},	
	
	callbacks : {
		"/control/runScript": function(args) {
			eval(args[2]);
		},
		"/control/addWidget": function(args) {
			var w = {};
            eval("w = " + args[2]);
			
            var isImportant = false;
			
            if(typeof args[3] != "undefined") {                // if there is an options dictionary included with the widget, used for autogui
                var options = args[3].replace(/\'/gi, "\"");   // replace any single quotes in json string
                try {
                    options = jQuery.parseJSON(options);            // since this might be an 'important' string, don't fail on json parsing error
                }catch (e) {}
                
                if(typeof options == 'object') {                    // will be object if json parsing successful, otherwise will be string
                    jQuery.each(options, function(key, val) {       // loop through options dict and add all key/value pairs to widget
						w[key] = val;
                    });
                }else{
                    isImportant = true;
                }
			}
            var _w = control.makeWidget(w);
            control.widgets.push(_w);
                        
            if(typeof _w.bounds == "undefined") {
                this.autogui.placeWidget(_w, isImportant);
            }

            eval("control.addWidget(" + w.name + ", control.currentPage);");
		},
		"/control/removeWidget": function(args) {
            control.removeWidgetWithName(args[2]);
		},
        "/control/setBounds": function(args) {
            var w = control.getWidgetWithName(args[2]);
            w.setBounds([args[3], args[4], args[5], args[6]]);
        },
        "/control/setColors": function(args) {
            var w = control.getWidgetWithName(args[2]);
            w.setColors([args[3], args[4], args[5]]);
		},
        "/control/setRange": function(args) {
            var w = control.getWidgetWithName(args[2]);
            w.setRange(args[3], args[4]);
		},
        "/control/setAddress": function(args) {
            var w = control.getWidgetWithName(args[2]);
            w.address = args[3];
		},
		"/control/createBlankInterface": function(args) {
            control.unloadWidgets();

        	this.autogui = new AutoGUI();
			
            var _json = "loadedInterfaceName = '" + args[2] + "'; interfaceOrientation = '" + args[3] + "'; pages = [[";
            if(typeof args[4] == "undefined" || args[4] == "true") {
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
	    },	
	},
	
	processOSC : function(oscAddress, typetags, args) {
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
	},

	sendOSC : function() {
		var address  = arguments[0];
	    var typetags = arguments[1];
	
		var args = [address, typetags];
		for(var i = 0; i < typetags.length; i++) {
			var arg = arguments[i + 2];
			args.push(arg);
		}
		//console.log("args length :" + args.length + " contents: " + args);
	
		PhoneGap.exec(null, null, 'OSCManager', 'send', args);
	},	
};