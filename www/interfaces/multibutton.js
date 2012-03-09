Control.data = {
	infoText : "This interfaces shows the different modes for the Button / MultiButton widgets. Toggle stays lit until it is pressed again, momentary stays lit until the touch leaves the button, latch stays on until the touch leaves the phone and contact only flashes quickly when first pressed. <br><br>Buttons and sliders also have a property called requiresTouchDown. When this property is set to true, you can only manipulate a widget if the touch event started on that particular widget. You can turn this on and off in this demo interface to see the results.<br><br>For output, the MultiButton outputs to the following OSC address:<br><br>/multi/buttonNumber value <br><br>where buttonNumber starts from the top left at 0 and proceeds row by row downwards. As an example, if we had a MultiButton widget with four rows and four columns the first button in the second row would be buttonNumber 4 (remember, the count starts at 0). MIDI outputs works the same way outputting note messages.",
};

Control.functions = {
	buttonKiller : function() {
	    for (var i = 0; i < multi.children.length; i++) {
	        multi.children[i].setValue(0);
	    }
	},
	
	buttonChanger : function(mode) {
		modeLabel.setValue("mode : " + mode);
	    for (var i = 0; i < multi.children.length; i++) {
	        var btn = multi.children[i];
	        btn.mode = mode;
	        btn.setValue(0);
	    }
	},
    
	requireTouchDown : function() {
	    for (var i = 0; i < multi.children.length; i++) {
	        var btn = multi.children[i];
	        if (this.value == 1) {
	            btn.requiresTouchDown = true;
	        } else {
	            btn.requiresTouchDown = false;
	        }
	    }
	},
};


Control.interface = {
	name : "multibutton demo",
	orientation : "portrait",
	pages : [[
	{
	    "name": "multi",
	    "type": "MultiButton",
	    "x": 0,
	    "y": 0,
	    "rows": 8,
	    "columns": 8,
	    "width": .99,
	    "height": .6,
	    "startingValue": 0,
	    "color": "#990000",
	    "stroke": "#dd0000",
	    "min": 0,
	    "max": 127,
	    "mode": "toggle",
	    "protocol": "MIDI",
	    "midiType": "noteon",
	    "channel": 2,
	    "number": 0,
	    "requiresTouchDown": false,
	},
	{
	    "name": "tabButton",
	    "type": "Button",
		"bounds": [.65,.75,.175,.075], 
	    "mode": "toggle",
	    "color": "#333333",
	    "stroke": "#aaaaaa",
		"isLocal": true,
		"label": "menu", 
	    "ontouchstart": function() { if(this.value == 1) { Control.showToolbar(); } else { Control.hideToolbar(); } },
	},
	{
	    "name": "modeLabel",
	    "type": "Label",
		"bounds": [0,.625,.5,.05], 
	    "value": "mode : toggle",
		"align": "left",
	},
	{
	    "name": "toggleButton",
	    "type": "Button",
		"bounds": [0,.675,.25,.075], 
	    "mode": "contact",
	    "color": "#ff0000",
	    "stroke": "#aaaaaa",
	    "min": 0,
	    "max": 1,
	    "isLocal": true,
		"label": "toggle", 
	    "ontouchstart": function() { Control.functions.buttonChanger("toggle") },
	},
    
	{
	    "name": "momentaryButton",
	    "type": "Button",
		"bounds": [.25,.675,.25,.075], 
	    "mode": "contact",
	    "color": "#ff0000",
	    "stroke": "#aaaaaa",
	    "min": 0,
	    "max": 1,
	    "isLocal": true, 
		"label": "momentary", 
	    "ontouchstart": function() { Control.functions.buttonChanger("momentary") },
	},
	{
	    "name": "latchButton",
	    "type": "Button",
		"bounds": [0,.75,.25,.075], 
	    "mode": "contact",
	    "color": "#ff0000",
	    "stroke": "#aaaaaa",
	    "min": 0,
	    "max": 1,
	    "isLocal": true,
		"label": "latch",
	    "ontouchstart": function() { Control.functions.buttonChanger("latch") },
	},
    
	{
	    "name": "contactButton",
	    "type": "Button",
		"bounds": [.25,.75,.25,.075], 
	    "mode": "contact",
	    "color": "#ff0000",
	    "stroke": "#aaaaaa",
	    "min": 0,
	    "max": 1,
		"isLocal": true, 
		"label": "contact", 
	    "ontouchstart": function() { Control.functions.buttonChanger("contact") },
	},
	{
	    "name": "touchdownButton",
	    "type": "Button",
	    "x": .65,
	    "y": .675,
	    "width": .345,
	    "height": .075,
	    "mode": "toggle",
	    "color": "#ff0000",
	    "stroke": "#aaaaaa",
	    "min": 0,
	    "max": 1,
	    "isLocal": true,
		"label": "require touchdown", 
	    "ontouchstart": Control.functions.requireTouchDown,
	},
    
	{
	    "name": "infoButton",
	    "type": "Button",
	    "x": .825,
	    "y": .75,
	    "width": .17,
	    "height": .075,
	    "mode": "contact",
	    "color": "#333333",
	    "stroke": "#aaaaaa",
		"isLocal": true, 
		"label": "info", 
	    "ontouchstart": function() { Control.changePage(1); },
	},
	],
	[
	{
	    "name": "infoText",
	    "type": "Label",
	    "x": .1,
	    "y": .1,
	    "width": .8,
	    "height": .7,
	    "value": Control.data.infoText,
	    "verticalCenter": false,
	    "align": "left",
	},
	{
	    "name": "backButton",
	    "type": "Button",
	    "x": .8,
	    "y": .9,
	    "width": .19,
	    "height": .09,
	    "mode": "contact",
	    "color": "#333333",
	    "stroke": "#aaaaaa",
	  	"isLocal": true, 
		"label": "back", 
	    "ontouchstart": function() { Control.changePage(0); },
	},
	]],
};