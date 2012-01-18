window.oscManager = {
    delegate : null,
    start: function() {
        console.log("OSC MANAGER START CALLED");
        return PhoneGap.exec(null, null, "OSCManager", "startPolling", []);
    },

	processOSCMessage : function() {
		var address = arguments[0];
		
		if(typeof this.callbacks[address] != "undefined") {	// if Control has a defined callback for this address ...
			this.callbacks[address](arguments);				// ... call the function associated with it ...
			console.log("CALLED CALLBACK FOR " + address);
		}else{                                              // ... else call processOSC on the oscManager delegate
			var args = [];

			for(var i = 2; i < arguments.length; i++) {
				args[i - 2] = arguments[i];
			}
			this.delegate.processOSC(address, arguments[1], args);
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
			
            if(typeof args[3] != "undefined") {                     // if there is an options dictionary included with the widget, used for autogui
                var options = args[3].replace(/\'/gi, "\"");        // replace any single quotes in json string
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
                if(!control.isWidgetSensor(w) ) {
                    window.autogui.placeWidget(_w, isImportant);
                }
            }

            eval("control.addWidget(" + w.name + ", control.currentPage);");
		},
		"/control/autogui/redoLayout" : function(args) {
			window.autogui.redoLayout();
		},
		"/control/removeWidget": function(args) {
            if(typeof window.autogui != "undefined") {
                window.autogui.removeWidget( control.getWidgetWithName(args[2]) );
            }
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
			
			window.autogui.redoLayout();
	    },
		// TODO: clear interface?	
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

window.oscManager.delegate = window.oscManager;