interfaceString = "loadedInterfaceName = \"Accelerometer\";\
\
interfaceOrientation = \"portrait\";\
\
whRatio = 2 / 3;\
\
infoText = \"This interface shows the Accelerometer in use. The update rate slider can be used to change the number of times per second the accelerometer reports its values. The accelerometer values are sent to /accelerometer.\";\
\
pages = [[\
{\
    \"name\": \"accLabel\",\
    \"type\": \"Label\",\
    \"x\": 0,\
    \"y\": .0,\
    \"width\": .2,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"align\": \"left\",\
    \"value\": \"ACCELEROMETER\",\
},\
{\
    \"name\": \"xAccLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .2,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"xAcc\",\
},\
{\
    \"name\": \"yAccLabel\",\
    \"type\": \"Label\",\
    \"x\": .33,\
    \"y\": .2,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"yAcc\",\
},\
{\
    \"name\": \"zAccLabel\",\
    \"type\": \"Label\",\
    \"x\": .66,\
    \"y\": .2,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"zAcc\",\
},\
\
{\
    \"name\": \"accSliders\",\
    \"type\": \"MultiSlider\",\
    \"numberOfSliders\": 3,\
    \"x\": .0,\
    \"y\": .05,\
	\"min\":0,\
	\"max\":127,\
	\"midiNumber\":3,\
    \"isVertical\": true,\
    \"width\": .99,\
    \"height\": .15,\
	\"isLocal\":true,\
},\
{\
    \"name\": \"accelerometerSpeed\",\
    \"type\": \"Slider\",\
    \"x\": 0,\
    \"y\": .275,\
    \"width\": .99,\
    \"height\": .075,\
    \"isLocal\": true,\
    \"min\": 1,\
    \"max\": 100,\
    \"startingValue\": 10,\
    \"ontouchend\": \"accSpeedLabel.changeValue(\'Update Rate : \' + (Math.round(this.value*10) / 10) +\'Hz\'); acc.setUpdateRate(this.value); \",\
},\
{\
    \"name\": \"accSpeedLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .32  5,\
    \"width\": 1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"Update Rate : 10Hz\",\
	\"align\": \"left\",\
},\
{\
    \"name\": \"tabButton\",\
    \"type\": \"Button\",\
    \"x\": .8,\
    \"y\": .85,\
    \"width\": .19,\
    \"height\": .15 * whRatio,\
    \"mode\": \"toggle\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#aaaaaa\",\
    \"isLocal\": true,\
	\"ontouchstart\": \"if(this.value == this.max) { control.showToolbar(); } else { control.hideToolbar(); }\",\
},\
\
{\
    \"name\": \"tabButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .8,\
    \"y\": .85,\
    \"width\": .19,\
    \"height\": .15 * whRatio,\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"value\": \"menu\",\
},\
\
{\
    \"name\": \"infoButton\",\
    \"type\": \"Button\",\
    \"x\": .6,\
    \"y\": .85,\
    \"width\": .2,\
    \"height\": .15 * whRatio,\
    \"mode\": \"contact\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#aaaaaa\",\
    \"midiType\": \"noteon\",\
    \"isLocal\": true,\
    \"ontouchstart\": \"control.changePage(1);\",\
},\
{\
    \"name\": \"infoButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .6,\
    \"y\": .85,\
    \"width\": .2,\
    \"height\": .15 * whRatio,\
    \"color\": \"#fff\",\
    \"value\": \"info\",\
},\
\
{\
    \"name\": \"acc\",\
    \"type\": \"Accelerometer\",\
	\"min\":0,\
	\"max\":127,\
	\"updateRate\":10,\
	\"midiNumber\": 0,\
	\"isLocal\":false,\
    \"onvaluechange\": \"accSliders.setSequentialValues(acc.x, acc.y, acc.z);\",\
	\"address\":\"/accelerometer\",\
},\
\
\
],\
\
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
    \"isLocal\": true,\
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
],];";