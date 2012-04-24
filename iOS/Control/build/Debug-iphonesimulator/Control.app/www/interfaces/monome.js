Control.data = {
	infoText : "The monome (monome.org) is an excellent hardware OSC controller that consists of a grid of toggle buttons whose status is decoupled from physical control. This means that whether or not an individual button is lit is determined by software interfacing with the monome, not whether or not a user is pressing a button. There are many interesting applications desgined to be run in conjunction with the monome; this emulation is designed to work with those applications. In order to use it you will need to make sure that the application knows the IP address and port of Control. Note that most monome apps receive on port 8000 and transmit to 8080.<br><br>Although this is an emulation of a 8x8 monome there is also a 8x16 (monome 128) interface available from the Control website. This 8x8 interface also contains a couple of sliders outputting to /slider1 and /slider2.<br><br> Control and its authors are not affiliated with (but have infinite respect for) the monome project.",
	whRatio : 2/3,
    oscPrefix : "/40h",
}

Control.interface = {
	name : "Monome Emulation",
	orientation : "landscape",
	
	pages : [[
              {
              "name": "refresh",
              "type": "Button",
              "bounds": [.7,.9,.1,.1],
              "label": "refresh",
              "isLocal": true,
              "mode": "contact",
              "ontouchstart": "Control.interfaceManager.refreshInterface()",
              "stroke": "#aaa",
              },
              {
              "name":"monome",
              "type":"MultiButton",
              "bounds":[0, 0, .99 * Control.data.whRatio, .99],
              "rows":8,
              "columns":8,
              "range":[0,1],
              "mode":"momentary",
              "color":"#666",
              "stroke":"#aaa",
              "isLocal":true,
              "requiresTouchDown":false,
              "onvaluechange": "Control.oscManager.sendOSC(this.address, 'iii', this.column, this.row, this.value);",
              "oninit": "Control.functions.monomeInit();",
              },
              {
              "name": "slider1",
              "type": "Slider",
              "color":"#666",
              "stroke":"#aaa",
              "bounds": [.75, .2, .1, .8],
              "isVertical": true,
              },
              {
              "name": "slider2",
              "type": "Slider",
              "color":"#666",
              "stroke":"#aaa",
              "bounds": [.875, .2, .1, .8],
              "isVertical": true,
              },
              {
              "name": "tabButton",
              "type": "Button",
              "bounds": [.875,0,.1,.1],
              "mode": "toggle",
              "colors": ["#000", "#666", "#aaa"],
              "label": "menu",
              "isLocal": true,
              "ontouchstart": "Control.toggleToolbar();",
              },
              {
              "name": "infoButton",
              "type": "Button",
              "bounds":[.75, 0, .1, .1],
              "mode": "contact",
              "color": "#333333",
              "stroke": "#aaaaaa",
              "label": "info",
              "isLocal": true,
              "ontouchstart": "Control.changePage(1);",
              },
              ],
             [
              {
              "name":"infoText",
              "type":"Label",
              "bounds": [.1, .1, .8, .7],
              "value":Control.data.infoText,
              "verticalCenter":false,
              "align":"left",
              },
              {
              "name": "backButton",
              "type": "Button",
              "bounds": [.8, .9, .19, .09],
              "mode":"contact",
              "color": "#333",
              "stroke": "#aaa",
              "isLocal":true,
              "label": "back",
              "ontouchstart":"Control.changePage(0);",
              },
              ] ],
};

Control.functions = {
    monomeInit : function() {
        var monome = window.monome;
        if(monome.rows == 8 && monome.columns == 8) {
            monome.numberOfUnits = 1;
        }else if (monome.columns == 16) {
            monome.numberOfUnits = 2;
        }else if (monome.rows == 16 && monome.columns == 16) {
            monome.numberOfUnits = 4;
        }
        Control.functions.changeAddresses();
        Control.oscManager.delegate = Control.functions;
    },

    changeAddresses : function() {
        var monome = window.monome;
        
        for(var i = 0; i < monome.children.length; i++) {
            var btn = monome.children[i];
            btn.row = Math.floor(i / monome.columns);
            btn.column = i % monome.columns;
            btn.address = Control.data.oscPrefix + "/press";
        }	
    },

    lightRow : function(row, unit, value) {
        var monome = window.monome;
        var baseNumber = row * monome.columns; 
        
        var mask, n;
        var onOff = value;
        for(var i = 7; i >= 0; i--) {
            var mask = 1 << i;
            var btnNumber = baseNumber + i + ((unit - 1) * 8);
            monome.setValue(btnNumber, ((onOff & mask) != 0), false);
        }
    },
    processOSC : function(oscAddress, typetags, args) {
        if(oscAddress != "/level/led_col") {
            console.log("msgs! " + oscAddress);
        }
        var monome = window.monome;
        switch(oscAddress) {
            case Control.data.oscPrefix + "/led" :
                var buttonNumber = args[1] * monome.columns + args[0];
                if(buttonNumber >= 0 && buttonNumber < (monome.rows * monome.columns)) {
                    monome.setValue(buttonNumber, args[2], false);
                }
                break;
            case Control.data.oscPrefix + "/led_row" :
                for(var unit = 1; unit <= monome.numberOfUnits; unit++)
                    Control.functions.lightRow(args[0], unit, args[1]);
                break;
            case Control.data.oscPrefix + "/led_col" :
                var col = args[0];
                var onOff = args[1];
                
                var mask, n;
                for(var i = 0; i <= monome.rows; i++) {
                    var mask = 1 << i;
                    var columnNumber = (i * monome.columns) + col;
                    monome.setValue(columnNumber, ((onOff & mask) != 0), false);
                }
                break;
            case Control.data.oscPrefix + "/led_frame" :
                for(var i = 0; i < monome.rows; i++) {
                    if(typeof args[i] != "undefined") {
                        for(var unit = 1; unit <= monome.numberOfUnits; unit++)
                            Control.functions.lightRow(i, unit, args[i]);
                    }
                }
                break;	
            case Control.data.oscPrefix + "/intensity" :	
                var colorValue = Math.round(args[0] * 255);
                var colorString = "rgb(" + colorValue + "," + colorValue + "," + colorValue +")";
                
                for(var i = 0; i < window.monome.children.length; i++) {
                    var btn = window.monome.children[i];					
                    btn.color = colorString;
                }
                window.monome.draw();
                break;
            case Control.data.oscPrefix + "/test" :	
                for(var i = 0; i < window.monome.children.length; i++) {
                    window.monome.setValue(i, args[0], false);	
                }
                break;
            case "/sys/prefix":
                console.log("PREFIXING");
                Control.data.oscPrefix = args[0];
                Control.functions.changeAddresses();
            default:
                break;
        }
    },

};