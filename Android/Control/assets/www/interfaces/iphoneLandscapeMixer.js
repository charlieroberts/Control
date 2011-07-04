interfaceString = "loadedInterfaceName = \"Mixer - Landscape\";\
\
interfaceOrientation = \"landscape\";\
control.orientation = 90;\
\
infoText = \"This is a basic 12 track mixer setup. Note that there are multiple pages; although they look alike with the exception of the volume slider labels they send out different information. MIDI information has not been configured for this interface. The OSC addresses are labeled... just add whatever the track number is to the labels shown. For example the volume for track 1 is /vol1, the pan for track 3 is /pan3 etc.<br><br>This mixer works better on an iPad as the pan knobs are too small to manipulate on an iPhone.\";\
\
constants = [\
{\
    \"name\": \"solo1Label\",\
    \"type\": \"Label\",\
    \"x\": .125,\
    \"y\": .27,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"solo\",\
},\
{\
    \"name\": \"solo2Label\",\
    \"type\": \"Label\",\
    \"x\": .275,\
    \"y\": .27,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"solo\",\
},\
{\
    \"name\": \"mute1Label\",\
    \"type\": \"Label\",\
    \"x\": .125,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"mute\",\
},\
{\
    \"name\": \"mute2Label\",\
    \"type\": \"Label\",\
    \"x\": .275,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"mute\",\
},\
{\
    \"name\": \"mute3Label\",\
    \"type\": \"Label\",\
    \"x\": .425,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"mute\",\
},\
{\
    \"name\": \"solo3Label\",\
    \"type\": \"Label\",\
    \"x\": .425,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"solo\",\
},\
{\
    \"name\": \"mute4Label\",\
    \"type\": \"Label\",\
    \"x\": .575,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"mute\",\
},\
{\
    \"name\": \"solo4Label\",\
    \"type\": \"Label\",\
    \"x\": .575,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"solo\",\
},\
{\
    \"name\": \"mute5Label\",\
    \"type\": \"Label\",\
    \"x\": .725,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"mute\",\
},\
{\
    \"name\": \"solo5Label\",\
    \"type\": \"Label\",\
    \"x\": .725,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"solo\",\
},\
{\
    \"name\": \"mute6Label\",\
    \"type\": \"Label\",\
    \"x\": .875,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"mute\",\
},\
{\
    \"name\": \"solo6Label\",\
    \"type\": \"Label\",\
    \"x\": .875,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"solo\",\
},\
{\
    \"name\": \"tabButton\",\
    \"type\": \"Button\",\
    \"x\": .0,\
    \"y\": .525,\
    \"width\": .09,\
    \"height\": .1,\
    \"color\": \"#666\",\
    \"isLocal\": true,\
	\"ontouchstart\": \"if(this.value == this.max) { control.showToolbar(); } else { control.hideToolbar(); }\",\
},\
{\
    \"name\": \"tabsLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .525,\
    \"width\": .09,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"menu\",\
},\
{\
    \"name\": \"infoButton\",\
    \"type\": \"Button\",\
    \"x\": .0,\
    \"y\": .625,\
    \"width\": .09,\
    \"height\": .1,\
    \"mode\": \"contact\",\
    \"color\": \"#666\",\
    \"isLocal\": true,\
    \"ontouchstart\": \"control.changePage(2);\",\
},\
{\
    \"name\": \"infoButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .625,\
    \"width\": .09,\
    \"height\": .1,\
    \"color\": \"#fff\",\
    \"value\": \"info\",\
},\
{\
    \"name\": \"volumeOSCLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .4,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"/vol\",\
},\
{\
    \"name\": \"soloOSCLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .275,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"/solo\",\
},\
{\
    \"name\": \"muteOSCLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .175,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"/mute\",\
},\
{\
    \"name\": \"panOSCLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .05,\
    \"width\": .1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"/pan\",\
},\
{\
    \"name\": \"page0Button\",\
    \"type\": \"Button\",\
    \"x\": .0,\
    \"y\": .725,\
    \"width\": .09,\
    \"height\": .1,\
    \"color\": \"#666666\",\
    \"mode\": \"contact\",\
    \"startingValue\": 1,\
    \"ontouchstart\": \"control.changePage(0);\",\
},\
{\
    \"name\": \"page0ButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .725,\
    \"width\": .09,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"1 - 6\",\
},\
{\
    \"name\": \"page1Button\",\
    \"type\": \"Button\",\
    \"x\": .0,\
    \"y\": .825,\
    \"width\": .09,\
    \"height\": .1,\
    \"color\": \"#666666\",\
    \"mode\": \"contact\",\
    \"ontouchstart\": \"control.changePage(1);\",\
},\
{\
    \"name\": \"page1ButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .825,\
    \"width\": .09,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"7-12\",\
},\
];\
\
pages = [[\
{\
    \"name\": \"vol1Slider\",\
    \"type\": \"Slider\",\
    \"x\": .1,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol1\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 1,\
},\
{\
    \"name\": \"vol2Slider\",\
    \"type\": \"Slider\",\
    \"x\": .25,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol2\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 2,\
},\
{\
    \"name\": \"vol3Slider\",\
    \"type\": \"Slider\",\
    \"x\": .4,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol3\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 3,\
},\
{\
    \"name\": \"vol4Slider\",\
    \"type\": \"Slider\",\
    \"x\": .55,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol4\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 4,\
},\
{\
    \"name\": \"vol5Slider\",\
    \"type\": \"Slider\",\
    \"x\": .7,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol5\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 5,\
},\
{\
    \"name\": \"vol6Slider\",\
    \"type\": \"Slider\",\
    \"x\": .85,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol6\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 6,\
},\
{\
    \"name\": \"vol1Label\",\
    \"type\": \"Label\",\
    \"x\": .1,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"1\",\
},\
{\
    \"name\": \"vol2Label\",\
    \"type\": \"Label\",\
    \"x\": .25,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"2\",\
},\
{\
    \"name\": \"vol3Label\",\
    \"type\": \"Label\",\
    \"x\": .4,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"3\",\
},\
{\
    \"name\": \"vol4Label\",\
    \"type\": \"Label\",\
    \"x\": .55,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"4\",\
},\
{\
    \"name\": \"vol5Label\",\
    \"type\": \"Label\",\
    \"x\": .7,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"5\",\
},\
{\
    \"name\": \"vol6Label\",\
    \"type\": \"Label\",\
    \"x\": .85,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"6\",\
},\
\
{\
    \"name\": \"pan1\",\
    \"type\": \"Knob\",\
    \"x\": .12,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan1\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 13,\
},\
{\
    \"name\": \"mute1\",\
    \"type\": \"Button\",\
    \"x\": .125,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"startingValue\": 0,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute1\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 25,\
},\
{\
    \"name\": \"solo1\",\
    \"type\": \"Button\",\
    \"x\": .125,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo1\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 37,\
},\
\
{\
    \"name\": \"pan2\",\
    \"type\": \"Knob\",\
    \"x\": .27,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan2\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 14,\
},\
{\
    \"name\": \"mute2\",\
    \"type\": \"Button\",\
    \"x\": .275,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute2\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 26,\
},\
\
{\
    \"name\": \"solo2\",\
    \"type\": \"Button\",\
    \"x\": .275,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo2\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 38,\
},\
\
{\
    \"name\": \"pan3\",\
    \"type\": \"Knob\",\
    \"x\": .42,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan2\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 15,\
},\
{\
    \"name\": \"mute3\",\
    \"type\": \"Button\",\
    \"x\": .425,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute3\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 27,\
},\
\
{\
    \"name\": \"solo3\",\
    \"type\": \"Button\",\
    \"x\": .425,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo3\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 39,\
},\
\
{\
    \"name\": \"pan4\",\
    \"type\": \"Knob\",\
    \"x\": .57,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan4\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 16,\
},\
{\
    \"name\": \"mute4\",\
    \"type\": \"Button\",\
    \"x\": .575,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute4\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 28,\
},\
\
{\
    \"name\": \"solo4\",\
    \"type\": \"Button\",\
    \"x\": .575,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo3\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 40,\
},\
\
{\
    \"name\": \"pan5\",\
    \"type\": \"Knob\",\
    \"x\": .72,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan5\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 17,\
},\
{\
    \"name\": \"mute5\",\
    \"type\": \"Button\",\
    \"x\": .725,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute5\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 29,\
},\
\
{\
    \"name\": \"solo5\",\
    \"type\": \"Button\",\
    \"x\": .725,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo5\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 41,\
},\
\
{\
    \"name\": \"pan6\",\
    \"type\": \"Knob\",\
    \"x\": .87,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan6\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 18,\
},\
{\
    \"name\": \"mute6\",\
    \"type\": \"Button\",\
    \"x\": .875,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute6\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 30,\
},\
\
{\
    \"name\": \"solo6\",\
    \"type\": \"Button\",\
    \"x\": .875,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo6\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 42,\
},\
],\
\
[\
{\
    \"name\": \"vol7Slider\",\
    \"type\": \"Slider\",\
    \"x\": .1,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol7\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 7,\
},\
{\
    \"name\": \"vol8Slider\",\
    \"type\": \"Slider\",\
    \"x\": .25,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol8\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 8,\
},\
{\
    \"name\": \"vol9Slider\",\
    \"type\": \"Slider\",\
    \"x\": .4,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol9\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 9,\
},\
{\
    \"name\": \"vol10Slider\",\
    \"type\": \"Slider\",\
    \"x\": .55,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol10\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 10,\
},\
{\
    \"name\": \"vol11Slider\",\
    \"type\": \"Slider\",\
    \"x\": .7,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol11\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 11,\
},\
{\
    \"name\": \"vol12Slider\",\
    \"type\": \"Slider\",\
    \"x\": .85,\
    \"y\": .43,\
    \"width\": .15,\
    \"height\": .5,\
    \"startingValue\": .5,\
	\"midiStartingValue\":63,	\
    \"color\": \"#666666\",\
    \"stroke\": \"#888888\",\
    \"min\": 0,\
    \"max\": 1,\
    \"isInverted\": false,\
    \"isVertical\": true,\
    \"protocol\": \"OSC\",\
    \"address\": \"/vol12\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 12,\
},\
{\
    \"name\": \"vol7Label\",\
    \"type\": \"Label\",\
    \"x\": .1,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"7\",\
},\
{\
    \"name\": \"vol8Label\",\
    \"type\": \"Label\",\
    \"x\": .25,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"8\",\
},\
{\
    \"name\": \"vol9Label\",\
    \"type\": \"Label\",\
    \"x\": .4,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"9\",\
},\
{\
    \"name\": \"vol10Label\",\
    \"type\": \"Label\",\
    \"x\": .55,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"10\",\
},\
{\
    \"name\": \"vol11Label\",\
    \"type\": \"Label\",\
    \"x\": .7,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"11\",\
},\
{\
    \"name\": \"vol12Label\",\
    \"type\": \"Label\",\
    \"x\": .85,\
    \"y\": .8,\
    \"width\": .15,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"12\",\
},\
{\
    \"name\": \"pan7\",\
    \"type\": \"Knob\",\
    \"x\": .12,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan6\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 19,\
},\
{\
    \"name\": \"mute7\",\
    \"type\": \"Button\",\
    \"x\": .125,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute7\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 31,\
},\
{\
    \"name\": \"solo7\",\
    \"type\": \"Button\",\
    \"x\": .125,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo7\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 43,\
},\
{\
    \"name\": \"pan8\",\
    \"type\": \"Knob\",\
    \"x\": .27,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan8\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 20,\
},\
{\
    \"name\": \"mute8\",\
    \"type\": \"Button\",\
    \"x\": .275,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute8\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 32,\
},\
{\
    \"name\": \"solo8\",\
    \"type\": \"Button\",\
    \"x\": .275,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo8\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 44,\
},\
{\
    \"name\": \"pan9\",\
    \"type\": \"Knob\",\
    \"x\": .42,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan9\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 21,\
},\
{\
    \"name\": \"mute9\",\
    \"type\": \"Button\",\
    \"x\": .425,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute9\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 33,\
},\
{\
    \"name\": \"solo9\",\
    \"type\": \"Button\",\
    \"x\": .425,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo9\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 45,\
},\
{\
    \"name\": \"pan10\",\
    \"type\": \"Knob\",\
    \"x\": .57,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan10\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 22,\
},\
{\
    \"name\": \"mute10\",\
    \"type\": \"Button\",\
    \"x\": .575,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute10\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 34,\
},\
{\
    \"name\": \"solo10\",\
    \"type\": \"Button\",\
    \"x\": .575,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo10\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 46,\
},\
{\
    \"name\": \"pan11\",\
    \"type\": \"Knob\",\
    \"x\": .72,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan11\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 23,\
},\
{\
    \"name\": \"mute11\",\
    \"type\": \"Button\",\
    \"x\": .725,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute11\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 35,\
},\
{\
    \"name\": \"solo11\",\
    \"type\": \"Button\",\
    \"x\": .725,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo11\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 47,\
},\
{\
    \"name\": \"pan12\",\
    \"type\": \"Knob\",\
    \"x\": .87,\
    \"y\": .0,\
    \"radius\": .17,\
    \"centerZero\": true,\
    \"startingValue\": 0,\
    \"color\": \"#cccccc\",\
    \"min\": -1,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/pan12\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 24,\
},\
{\
    \"name\": \"mute12\",\
    \"type\": \"Button\",\
    \"x\": .875,\
    \"y\": .18,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": true,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/mute12\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 36,\
},\
{\
    \"name\": \"solo12\",\
    \"type\": \"Button\",\
    \"x\": .875,\
    \"y\": .28,\
    \"width\": .1,\
    \"height\": .1,\
    \"requiresTouchDown\": false,\
    \"color\": \"#666666\",\
    \"min\": 0,\
    \"max\": 1,\
    \"protocol\": \"OSC\",\
    \"address\": \"/solo12\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 48,\
},\
],\
[\
{\
    \"name\": \"bg\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .0,\
    \"width\": 1,\
    \"height\": 1,\
    \"value\": \"\",\
	\"backgroundColor\":\"rgba(0,0,0,1)\",\
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
	\"oninit\":\"backButton.fillDiv.style.zIndex = 10000\",\
},\
\
{\
    \"name\": \"infoText\",\
    \"type\": \"Label\",\
    \"x\": .1,\
    \"y\": .1,\
    \"width\": .8,\
    \"height\": .8,\
    \"value\": infoText,\
	\"backgroundColor\":\"rgba(0,0,0,1)\",\
    \"verticalCenter\": false,\
    \"align\": \"left\",\
	\"oninit\":\"infoText.label.style.zIndex = 10000\",\
},\
{\
    \"name\": \"backButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .8,\
    \"y\": .9,\
    \"width\": .19,\
    \"height\": .09,\
    \"color\": \"#fff\",\
    \"value\": \"back\",\
	\"oninit\":\"backButtonLabel.label.style.zIndex = 11001\",\
},\
],\
];";