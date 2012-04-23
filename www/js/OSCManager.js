Control.oscManager = {
    delegate : null,
    receivePort : 8080,
    
    start: function() {
        return PhoneGap.exec(null, null, "OSCManager", "startPolling", []);
    },
    
    setReceivePort : function(newPort) {
        this.receivePort = newPort;
        PhoneGap.exec(null, null, "OSCManager", "setOSCReceivePort", [newPort]);			  
    },

    processOSCMessage : function() {
        var address = arguments[0];
    
        if(typeof this.callbacks[address] != "undefined") {	// if Control has a defined callback for this address ...
            this.callbacks[address](arguments);				// ... call the function associated with it ...
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
            var json2 = args[2].replace(/\'/gi, "\"");        // replace any single quotes in json string

            try {
                w  = jQuery.parseJSON(json2);            // since this might be an 'important' string, don't fail on json parsing error
            }catch (e) {
                return;
            }
        
            var isImportant = false;
        	
			if(typeof w.page === "undefined") {
				w.page = Control.currentPage;
			}
			
            var _w = Control.makeWidget(w);
            _w.page = w.page;
                    
            if(typeof _w.bounds == "undefined") {
                if(!Control.isWidgetSensor(w) ) {
                    Control.autogui.placeWidget(_w, isImportant);
                }
            }
        
            var widgetPage = (typeof w.page !== "undefined") ? w.page : Control.currentPage;
            Control.addWidget(window[w.name], widgetPage);
        },
        "/control/addWidgetKV" : function(args) {
            var w = {};
            for (var i = 2; i < args.length; i+=2) {
                w[args[i]]=args[i+1];
            }
                                        
            var isImportant = false;
            
            if(typeof w.page === "undefined") {
                w.page = Control.currentPage;
            }
            
            var _w = Control.makeWidget(w);
            _w.page = w.page;
            
            if(typeof _w.bounds == "undefined") {
                if(!Control.isWidgetSensor(w) ) {
                    Control.autogui.placeWidget(_w, isImportant);
                }
            }
            
            var widgetPage = (typeof w.page !== "undefined") ? w.page : Control.currentPage;
            Control.addWidget(window[w.name], widgetPage);
        },
        "/control/autogui/redoLayout" : function(args) {
            Control.autogui.redoLayout();
        },
        "/control/removeWidget": function(args) {
            if(typeof Control.autogui !== "undefined") {
                Control.autogui.removeWidget( Control.getWidgetWithName(args[2]) );
            }
            Control.removeWidgetWithName(args[2]);
        },
        "/control/setBounds": function(args) {
            var w = Control.getWidgetWithName(args[2]);
            w.setBounds([args[3], args[4], args[5], args[6]]);
        },
        "/control/setColors": function(args) {
            var w = Control.getWidgetWithName(args[2]);
            w.setColors([args[3], args[4], args[5]]);
        },
        "/control/setRange": function(args) {
            var w = Control.getWidgetWithName(args[2]);
            w.setRange(args[3], args[4]);
        },
        "/control/setAddress": function(args) {
            var w = Control.getWidgetWithName(args[2]);
            w.address = args[3];
        },
        "/control/createBlankInterface": function(args) {
            Control.unloadWidgets();
        
            var _json = "Control.data = {}; Control.functions = {}; Control.interface = { name: '" + args[2] + "', orientation :'" + args[3] + "', constants : [";
            if(typeof args[4] == "undefined" || args[4] == "true") {
                _json += '{\
"name": "menuButton",\
"type": "Button",\
"bounds": [.8,.9,.2,.1],\
"mode":"toggle",\
"colors": ["#000", "#444", "#aaa"],\
"ontouchstart": "if(this.value == this.max) { Control.showToolbar();} else { Control.hideToolbar(); }",\
"label": "menu",\
},';
            }
            _json += "], pages : [[]], };";
            
            Control.interfaceManager.runInterface(_json);
            $.mobile.changePage('#SelectedInterfacePage');
            
            Control.autogui.redoLayout();
        },
        // TODO: clear interface?	
    },

    processOSC : function(oscAddress, typetags, args) {
        if(typeof Control.constants != "undefined") {
            for(var i = 0; i < Control.constants.length; i++) {
                var w = Control.constants[i];
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
        for(var i = 0; i < Control.widgets.length; i++) {
            var w = Control.widgets[i];
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