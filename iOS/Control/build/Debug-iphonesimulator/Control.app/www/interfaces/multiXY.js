Control.data = {
    whRatio: 2 / 3,
    infoText: "This is a demo of the MultiTouchXY widget. It starts by keeping track of 5 touches but you can add more by pressing the add touch button. If an OSC destination is selected it will output to the following address pattern : <br><br> /multi/touchNumber xValue yValue<br><br>If it is outputting MIDI the touches will start at CC 0. Even CC numbers will be the X values for each touch; odd willrepresent the Y values. For example, touch 3 will output a value between 0 - 127 based on its X value on CC 4, the y value will be on CC 5. <br><br>There is also a momentary mode for the MultiTouchXY widget where the positions are not retained; whenever a touch is released the corresponding square vanishes.",
};

Control.functions = {
    removeTouch: function() {
        var multi = window.multi;
        var touchToKill = multi.children.pop(); /* remove last child and map to variable */
        multi.container.removeChild(touchToKill); /* remove from web renderer */
    },
    addTouch: function() {
        multi.addTouch(multi.x + 20, multi.y + 20, multi.children.length);
    },
};

Control.interface = {
    name: "multitouch xyz",
    orientation: "portrait",
    pages: [
    [{
        "name": "multi",
        "type": "MultiTouchXY",
        "bounds": [0, 0, 1, .75],
        "midi": ["cc", 1, 1],
        "colors" : ["#000", "rgba(50,50,50,.5)", "#ccc"],
        "numberOfTouches": 1,
        "isMomentary": false,
    },
    
    {
        "name": "remover",
        "type": "Button",
        "bounds": [.0, .8, .2, .1],
        "isLocal": true,
        "ontouchend": function() {
            Control.functions.removeTouch();
        },
        "mode": "contact",
        "stroke": "#aaa",
        "label": "touch -", 
    }, {
        "name": "adder",
        "type": "Button",
        "bounds": [.2, .8, .2, .1],
        "isLocal": true,
        "ontouchend": function() {
            Control.functions.addTouch();
        },
        "mode": "contact",
        "stroke": "#aaa",
        "label": "touch +", 
    },{
        "name": "tabButton",
        "type": "Button",
        "bounds": [.8, .8, .2, .1],
        "mode": "toggle",
        "stroke": "#aaa",
        "isLocal": true,
        "ontouchstart": "if(this.value == this.max) { Control.showToolbar(); } else { Control.hideToolbar(); }",
        "label": "menu",
    }, {
        "name": "infoButton",
        "type": "Button",
        "bounds": [.6, .8, .2, .1],
        "mode": "contact",
        "color": "#333333",
        "stroke": "#aaaaaa",
        "isLocal": true,
        "ontouchstart": "Control.changePage(1);",
        "label": "info",
    }, ],
    [{
        "name": "infoText",
        "type": "Label",
        "x": .1,
        "y": .1,
        "width": .8,
        "height": .7,
        "value": Control.data.infoText,
        "verticalCenter": false,
        "align": "left",
    }, {
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
        "ontouchstart": "Control.changePage(0);",
    }, {
        "name": "infoButtonLabel",
        "type": "Label",
        "x": .8,
        "y": .9,
        "width": .19,
        "height": .09,
        "color": "#fff",
        "value": "back",
    },
    
    ]
    ],
	constants : [],
};
