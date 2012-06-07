Control.data = {
whRatio: 2 / 3,
infoText: "Conway\'s game of life is a famous example of cellular autotmata. Cells come to life and die based on their surrounding populations. I've included it here as an example of how Control enables the complex scripting of widgets. All of the game of life is included inside the JavaScript interface file; none of it is embedded within the app itself. This means that users can define similarly complex scripts without having to touch the core application code. This script turns the various children of the MultiButton widget on and off based on the rules of the game.<br><br>The game outputs MIDI noteon messages ranging from 0 - 121 (11 rows by 11 columns). OSC follows the same pattern, outputting to the address /life.",
lifeSpeed: 500,
};

Control.functions = {
buttonKiller: function() {
    for (var i = 0; i < life.children.length; i++) {
        life.children[i].setValue(0);
    }
},
runLife: function() {
    for (var row = 0; row < life.rows; row++) {
        for (var col = 0; col < life.columns; col++) {
            var cellNumber = (row * life.columns) + col;
            var neighborCount = 0;
            var cell = life.children[cellNumber];
            if (cell.value == cell.max) {
                cell.shouldDie = false;
            } else {
                cell.shouldLive = false;
            }
            
            if (row != 0) {
                if (life.children[cellNumber - life.columns].value == cell.max) {
                    neighborCount++;
                }
                if (col != life.columns - 1) {
                    if (life.children[cellNumber - life.columns + 1].value == cell.max) {
                        neighborCount++;
                    }
                }
                if (col != 0) {
                    if (life.children[cellNumber - life.columns - 1].value == cell.max) {
                        neighborCount++;
                    }
                }
            }
            if (col != 0) {
                if (life.children[cellNumber - 1].value == cell.max) {
                    neighborCount++;
                }
            }
            if (col != life.columns - 1) {
                if (life.children[cellNumber + 1].value == cell.max) {
                    neighborCount++;
                }
            }
            
            if (row != life.rows - 1) {
                if (life.children[cellNumber + life.columns].value == cell.max) {
                    neighborCount++;
                }
                if (col != life.columns - 1) {
                    if (life.children[cellNumber + life.columns + 1].value == cell.max) {
                        neighborCount++;
                    }
                }
                if (col != 0) {
                    if (life.children[cellNumber + life.columns - 1].value == cell.max) {
                        neighborCount++;
                    }
                }
            }
            if (cell.value == cell.max) {
                if (neighborCount < 2 || neighborCount > 3) {
                    cell.shouldDie = true;
                }
            } else {
                if (neighborCount == 3) {
                    cell.shouldLive = true;
                }
            }
        }
    }
    
    for (var i = 0; i < life.children.length; i++) {
        var cell = life.children[i];
        if (cell.value == cell.max) {
            if (cell.shouldDie) {
                cell.setValue(cell.min);
            }
        } else {
            if (cell.shouldLive) {
                cell.setValue(cell.max);
            }
        }
    }
    
    Control.timeout = setTimeout(Control.functions.runLife, Control.data.lifeSpeed);
},
};
Control.interface = {
name: "Conway's Game Of Life",
orientation: "portrait",
pages: [
        [{
         "name": "life",
         "type": "MultiButton",
         "x": 0,
         "y": 0,
         "rows": 11,
         "columns": 11,
         "width": .99,
         "height": .6,
         "startingValue": 0,
         "color": "#990000",
         "stroke": "#dd0000",
         "min": 0,
         "max": 127,
         "mode": "toggle",
         "midiType": "noteon",
         "channel": 2,
         "number": 0,
         "address": "/life",
         "requiresTouchDown": false,
         }, {
         "name": "killButton",
         "type": "Button",
         "x": .0,
         "y": .65,
         "width": .375,
         "height": .075,
         "mode": "contact",
         "color": "#ff0000",
         "stroke": "#ff0000",
         "min": 0,
         "max": 1,
         "protocol": "local",
         "ontouchstart": "Control.functions.buttonKiller();",
         "label": "kill all cells",
         }, {
         "name": "startButton",
         "type": "Button",
         "label": "start / stop",
         "x": .375,
         "y": .65,
         "width": .375,
         "height": .075,
         "mode": "toggle",
         "color": "#990000",
         "stroke": "#ff0000",
         "min": 0,
         "max": 1,
         "isLocal": true,
         "ontouchstart": function() {
         if (this.value == this.max) {
         Control.timeout = setTimeout(Control.functions.runLife, Control.data.lifeSpeed);
         } else {
         clearTimeout(Control.timeout);
         }
         },
         }, {
         "name": "speedSlider",
         "type": "Slider",
         "x": .0,
         "y": .75,
         "width": .75,
         "height": .075,
         "isVertical": false,
         "colors": ["#000", "#f00", "#f00"],
         "min": 50,
         "max": 1000,
         "startingValue": 500,
         "isLocal": true,
         "ontouchmove": function() {
         Control.data.lifeSpeed = this.value;
         },
         }, {
         "name": "speedLabel",
         "type": "Label",
         "x": .75,
         "y": .75,
         "width": .2,
         "height": .075,
         "color": "#f00",
         "value": "speed",
         }, {
         "name": "tabButton",
         "type": "Button",
         "x": .2,
         "y": .85,
         "width": .2,
         "height": .075,
         "mode": "toggle",
         "color": "#333333",
         "stroke": "#f00",
         "protocol": "local",
         "ontouchstart": "Control.toggleToolbar();",
         "label": "menu",
         }, {
         "name": "infoButton",
         "type": "Button",
         "x": .0,
         "y": .85,
         "width": .2,
         "height": .075,
         "mode": "contact",
         "color": "#333333",
         "stroke": "#f00",
         "midiType": "noteon",
         "protocol": "local",
         "ontouchstart": function() {
         Control.changePage(1);
         },
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
         "label": "back",
         "x": .8,
         "y": .9,
         "width": .19,
         "height": .09,
         "mode": "contact",
         "color": "#333333",
         "stroke": "#aaaaaa",
         "protocol": "local",
         "ontouchstart": function() {
         Control.changePage(0);
         },
         }, ],
        
        ],
    
};
