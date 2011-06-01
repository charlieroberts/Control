interfaceString = "loadedInterfaceName = \"Conway - Game Of Life\";\
\
interfaceOrientation = \"portrait\";\
\
whRatio = 2 / 3;\
\
infoText = \"Conway\'s game of life is a famous example of cellular autotmata. Cells come to life and die based on their surrounding populations. I\'ve included it here as an example of how Control enables the complex scripting of widgets. All of the game of life is included inside the JavaScript interface file; none of it is embedded within the app itself. This means that users can define similarly complex scripts without having to touch the core application code. This script turns the various buttons of the MultiButton widget on and off based on the rules of the game.<br><br>The game outputs MIDI noteon messages ranging from 0 - 121 (11 rows by 11 columns). OSC follows the same pattern, outputting to the address /life.\";\
\
control.lifeSpeed = 500;\
function check() {\
    for (var i = 0; i < life.children.length; i++) {\
        life.children[i].setValue(0);\
    }\
}\
control.buttonKiller = check;\
\
function runLife() {\
    for (var row = 0; row < life.rows; row++) {\
        for (var col = 0; col < life.columns; col++) {\
            var cellNumber = (row * life.columns) + col;\
            var neighborCount = 0;\
            var cell = life.children[cellNumber];\
            if (cell.value == cell.max) {\
                cell.shouldDie = false;\
            } else {\
                cell.shouldLive = false;\
            }\
\
            if (row != 0) {\
                if (life.children[cellNumber - life.columns].value == cell.max) {\
                    neighborCount++;\
                }\
                if (col != life.columns - 1) {\
                    if (life.children[cellNumber - life.columns + 1].value == cell.max) {\
                        neighborCount++;\
                    }\
                }\
                if (col != 0) {\
                    if (life.children[cellNumber - life.columns - 1].value == cell.max) {\
                        neighborCount++;\
                    }\
                }\
            }\
            if (col != 0) {\
                if (life.children[cellNumber - 1].value == cell.max) {\
                    neighborCount++;\
                }\
            }\
            if (col != life.columns - 1) {\
                if (life.children[cellNumber + 1].value == cell.max) {\
                    neighborCount++;\
                }\
            }\
\
            if (row != life.rows - 1) {\
                if (life.children[cellNumber + life.columns].value == cell.max) {\
                    neighborCount++;\
                }\
                if (col != life.columns - 1) {\
                    if (life.children[cellNumber + life.columns + 1].value == cell.max) {\
                        neighborCount++;\
                    }\
                }\
                if (col != 0) {\
                    if (life.children[cellNumber + life.columns - 1].value == cell.max) {\
                        neighborCount++;\
                    }\
                }\
            }\
            if (cell.value == cell.max) {\
                if (neighborCount < 2 || neighborCount > 3) {\
                    cell.shouldDie = true;\
                }\
            } else {\
                if (neighborCount == 3) {\
                    cell.shouldLive = true;\
                }\
            }\
        }\
    }\
\
    for (var i = 0; i < life.children.length; i++) {\
        var cell = life.children[i];\
        if (cell.value == cell.max) {\
            if (cell.shouldDie) {\
                cell.setValue(cell.min);\
            }\
        } else {\
            if (cell.shouldLive) {\
                cell.setValue(cell.max);\
            }\
        }\
    }\
    control.timeout = setTimeout(control.life, control.lifeSpeed);\
}\
\
control.life = runLife;\
pages = [[\
{\
    \"name\": \"life\",\
    \"type\": \"MultiButton\",\
    \"x\": 0,\
    \"y\": 0,\
    \"rows\": 11,\
    \"columns\": 11,\
    \"width\": .985,\
    \"height\": .64,\
    \"startingValue\": 0,\
    \"color\": \"#990000\",\
    \"stroke\": \"#dd0000\",\
    \"min\": 0,\
    \"max\": 127,\
	\"midiMin\":0,\
	\"midiMax\":127,\
    \"mode\": \"toggle\",\
    \"protocol\": \"MIDI\",\
    \"midiType\": \"noteon\",\
    \"channel\": 2,\
    \"number\": 0,\
    \"address\": \"/life\",\
    \"shouldUseCanvas\":false,\
    \"requiresTouchDown\": false,\
},\
{\
    \"name\": \"killButton\",\
    \"type\": \"Button\",\
    \"x\": .0,\
    \"y\": .65,\
    \"width\": .375,\
    \"height\": .075,\
    \"mode\": \"contact\",\
    \"color\": \"#ff0000\",\
    \"stroke\": \"#ff0000\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"local\",\
    \"ontouchstart\": \"control.buttonKiller()\"\
},\
{\
    \"name\": \"killLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .65,\
    \"width\": .375,\
    \"height\": .075,\
    \"value\": \"kill all cells\",\
},\
\
{\
    \"name\": \"startButton\",\
    \"type\": \"Button\",\
    \"x\": .375,\
    \"y\": .65,\
    \"width\": .375,\
    \"height\": .075,\
    \"mode\": \"toggle\",\
    \"color\": \"#ff0000\",\
    \"stroke\": \"#ff0000\",\
    \"min\": 0,\
    \"max\": 1,\
	\"isLocal\": true,\
    \"ontouchstart\": \"if(this.value == this.max) { console.log(\'RUN\');control.timeout = setTimeout(control.life, control.lifeSpeed); } else { clearTimeout(control.timeout); }\"\
},\
{\
    \"name\": \"startLabel\",\
    \"type\": \"Label\",\
    \"x\": .375,\
    \"y\": .65,\
    \"width\": .375,\
    \"height\": .075,\
    \"value\": \"start / stop\",\
},\
\
{\
    \"name\": \"speedSlider\",\
    \"type\": \"Slider\",\
    \"x\": .0,\
    \"y\": .75,\
    \"width\": .75,\
    \"height\": .075,\
    \"isVertical\": false,\
    \"color\": \"#ff0000\",\
    \"min\": 50,\
    \"max\": 1000,\
	\"midiMin\": 50,\
	\"midiMax\": 1000,\
	\"midiStartingValue\": 500,\
    \"startingValue\": 500,\
	\"isLocal\" : true,\
    \"ontouchmove\": \"control.lifeSpeed = this.value;\",\
},\
{\
    \"name\": \"speedLabel\",\
    \"type\": \"Label\",\
    \"x\": .75,\
    \"y\": .75,\
    \"width\": .2,\
    \"height\": .075,\
    \"value\": \"speed\",\
},\
\
{\
    \"name\": \"tabButton\",\
    \"type\": \"Button\",\
    \"x\": .2,\
    \"y\": .85,\
    \"width\": .2,\
    \"height\": .075,\
    \"mode\": \"toggle\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#f00\",\
    \"protocol\": \"local\",\
    \"ontouchstart\": \"if(this.value == this.max) { control.showToolbar(); } else { control.hideToolbar(); }\",\
},\
{\
    \"name\": \"tabButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .2,\
    \"y\": .85,\
    \"width\": .2,\
    \"height\": .075,\
    \"mode\": \"contact\",\
    \"protocol\": \"local\",\
    \"value\": \"menu\",\
},\
{\
    \"name\": \"infoButton\",\
    \"type\": \"Button\",\
    \"x\": .0,\
    \"y\": .85,\
    \"width\": .2,\
    \"height\": .075,\
    \"mode\": \"contact\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#f00\",\
    \"midiType\": \"noteon\",\
    \"protocol\": \"local\",\
    \"ontouchstart\": \"control.changePage(1);\",\
},\
{\
    \"name\": \"infoButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .85,\
    \"width\": .2,\
    \"height\": .075,\
    \"color\": \"#fff\",\
    \"value\": \"info\",\
},\
\
],\
[\
{\
    \"name\": \"infoText\",\
    \"type\": \"Label\",\
    \"x\": .1,\
    \"y\": .1,\
    \"width\": .8,\
    \"height\": .7,\
    \"value\": infoText,\
    \"verticalCenter\": false,\
    \"align\": \"left\",\
},\
{\
    \"name\": \"backButton\",\
    \"type\": \"Button\",\
    \"x\": .8,\
    \"y\": .9,\
    \"width\": .19,\
    \"height\": .09,\
    \"mode\": \"contact\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#aaaaaa\",\
    \"protocol\": \"local\",\
    \"ontouchstart\": \"control.changePage(0);\",\
},\
{\
    \"name\": \"infoButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .8,\
    \"y\": .9,\
    \"width\": .19,\
    \"height\": .09,\
    \"color\": \"#fff\",\
    \"value\": \"back\",\
},\
\
],\
\
];";
