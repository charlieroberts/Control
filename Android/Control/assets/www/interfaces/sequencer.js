interfaceString = "loadedInterfaceName = \"Sequencer\";\
interfaceOrientation = \"landscape\";\
\
infoText = \"This  is a simple step sequencer with an 8x16 grid and 8 16-step multisliders. The multisliders are assigned to CC 10 - 17 for MIDI, /sliders1 - /sliders8 for OSC. The button grid notes are designed to work with the Impulse instrument in Ableton Live; the MIDI notes are labeled and the osc address is /grid.\";\
\
whRatio = 2 / 3;\
\
control.notes = [60, 62, 64, 65, 67, 69, 71, 72];\
control.noteNames = [\"C4\", \"D4\", \"E4\", \"F4\",\"G4\",\"A4\",\"B4\",\"C5\"];\
\
function setButtonNumbers() {\
	for(i = 0; i < grid.rows; i++) {\
		for(j = 0; j < grid.columns; j++) {\
			var btn = grid.children[(i * grid.columns) + j];\
			btn.midiNumber = control.notes[control.notes.length - (i+1)];\
		}\
	}\
	\
}\
control.setButtonNumbers = setButtonNumbers;\
\
function setSliderNumbers(ms, num) {\
	for(var i = 0; i < ms.children.length; i++) {\
		var slider = ms.children[i];\
		slider.midiNumber = num;\
	}\
}\
control.setSliderNumbers = setSliderNumbers;\
\
window.tempo = 200;\
window.count = -1;\
\
function run() {\
	if(window.count == -1) {\
		window.beatWidth = parseInt(beatMarker.label.style.width); window.count = 0;\
		window.leftPos = parseInt(beatMarker.label.style.left);\
	}\
	beatMarker.label.style.left = window.leftPos + (window.beatWidth * window.count) + \"px\";\
	\
	var lastNum = (window.count == 0) ? 15 : window.count - 1;\
	if(sliders0.children[window.count].value != sliders0.children[lastNum].value) { sliders0.children[window.count].output(); }\
	if(sliders1.children[window.count].value != sliders1.children[lastNum].value) { sliders1.children[window.count].output(); }\
	if(sliders2.children[window.count].value != sliders2.children[lastNum].value) { sliders2.children[window.count].output(); }\
	if(sliders3.children[window.count].value != sliders3.children[lastNum].value) { sliders3.children[window.count].output(); }\
	if(sliders4.children[window.count].value != sliders4.children[lastNum].value) { sliders4.children[window.count].output(); }\
	if(sliders5.children[window.count].value != sliders5.children[lastNum].value) { sliders5.children[window.count].output(); }\
	if(sliders6.children[window.count].value != sliders6.children[lastNum].value) { sliders6.children[window.count].output(); }\
	if(sliders7.children[window.count].value != sliders7.children[lastNum].value) { sliders7.children[window.count].output(); }\
\
	for(var i = 0; i < grid.rows; i++) {\
		var btn = grid.children[window.count + (i * grid.columns)];\
		btn.output();\
	}\
\
	if(window.count++ == 15) { window.count = 0; }\
	window.timeout = setTimeout(window.run, window.tempo);\
}\
window.run = run;\
\
function stop() {\
	clearTimeout(window.timeout);\
}\
window.stop = stop;\
\
function setTempo(newTempo) {\
	window.tempo = 250 / (newTempo / 60);\
}\
window.setTempo = setTempo;\
\
constants = [\
{\
    \"name\": \"info\",\
    \"type\": \"Button\",\
    \"x\": .85, \"y\": .75,\
    \"width\": .145, \"height\": .1,\
    \"startingValue\": 0,\
    \"isLocal\": true,\
    \"mode\": \"contact\",\
    \"ontouchstart\": \"control.changePage(8);\",\
    \"stroke\": \"#aaa\",\
},\
{\
    \"name\": \"infoLabel\",\
    \"type\": \"Label\",\
    \"x\": .85, \"y\": .75,\
    \"width\": .145, \"height\": .1,\
    \"isLocal\": true,\
    \"value\": \"info\",\
},\
{\
    \"name\": \"tabButton\",\
    \"type\": \"Button\",\
    \"x\": .85, \"y\": .85,\
    \"width\": .145, \"height\": .095,\
    \"mode\": \"toggle\",\
    \"isLocal\": true,\
    \"stroke\": \"#aaa\",\
	\"color\": \"#666\",\
	\"ontouchstart\": \"if(this.value == this.max) { control.showToolbar(); } else { control.hideToolbar(); }\",\
},\
{\
    \"name\": \"tabButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .85, \"y\": .85,\
    \"width\": .145, \"height\": .1,\
    \"value\": \"menu\",\
},\
\
\
{\
	\"name\": \"grid\",\
	\"type\": \"MultiButton\",\
	\"x\": .1, \"y\":.445,\
	\"width\": 1.10  * whRatio, \"height\": .47,\
	\"rows\": 8, \"columns\": 16,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"midiMin\":0,\
	\"midiMax\":127,\
	\"midiNumber\":60,\
	\"midiType\":\"noteon\",\
	\"requiresTouchDown\": false,\
	\"oninit\" : \"control.setButtonNumbers();\",\
},\
\
{\
	\"name\":\"beatMarker\", \"type\":\"Label\",\
	\"x\":.1, \"y\": .34,\
	\"width\":(1.10  * whRatio) / 16, \"height\":.09,\
	\"value\": \"\",\
	\"backgroundColor\":\"#444\",	\
},\
\
{ \
	\"name\": \"C4\", \"type\":\"Label\",\
	\"x\":0, \"y\": .915 - (.47 / 8),\
	\"width\":.1, \"height\":.47 / 8,\
	\"value\": \"C4\",\
},\
{ \
	\"name\": \"D4\", \"type\":\"Label\",\
	\"x\":0, \"y\": .915 - ((.47 / 8) * 2),\
	\"width\":.1, \"height\":.47 / 8,\
	\"value\": \"D4\",\
},\
\
{ \
	\"name\": \"E4\", \"type\":\"Label\",\
	\"x\":0, \"y\": .915 - ((.47 / 8) * 3),\
	\"width\":.1, \"height\":.47 / 8,\
	\"value\": \"E4\",\
},\
{ \
	\"name\": \"F4\", \"type\":\"Label\",\
	\"x\":0, \"y\": .915 - ((.47 / 8) * 4),\
	\"width\":.1, \"height\":.47 / 8,\
	\"value\": \"F4\",\
},\
\
{ \
	\"name\": \"G4\", \"type\":\"Label\",\
	\"x\":0, \"y\": .915 - ((.47 / 8) * 5),\
	\"width\":.1, \"height\":.47 / 8,\
	\"value\": \"G4\",\
},\
\
{ \
	\"name\": \"A4\", \"type\":\"Label\",\
	\"x\":0, \"y\": .915 - ((.47 / 8) * 6),\
	\"width\":.1, \"height\":.47 / 8,\
	\"value\": \"A4\",\
},\
{ \
	\"name\": \"B4\", \"type\":\"Label\",\
	\"x\":0, \"y\": .915 - ((.47 / 8) * 7),\
	\"width\":.1, \"height\":.47 / 8,\
	\"value\": \"B4\",\
},\
{ \
	\"name\": \"C5\", \"type\":\"Label\",\
	\"x\":0, \"y\": .915 - ((.47 / 8) * 8),\
	\"width\":.1, \"height\":.47 / 8,\
	\"value\": \"C5\",\
},\
\
{ \
	\"name\": \"beat1\", \"type\":\"Label\",\
	\"x\":.1, \"y\": .36,\
	\"width\":(1.10  * whRatio) / 16, \"height\":.045,\
	\"value\": \"1\",\
},\
{ \
	\"name\": \"beat2\", \"type\":\"Label\",\
	\"x\":.1 + ((1.10  * whRatio) / 16) * 4, \"y\": .36,\
	\"width\":(1.10  * whRatio) / 16, \"height\":.045,\
	\"value\": \"2\",\
},\
{ \
	\"name\": \"beat3\", \"type\":\"Label\",\
	\"x\":.1 + ((1.10  * whRatio) / 16) * 8, \"y\": .36,\
	\"width\":(1.10  * whRatio) / 16, \"height\":.045,\
	\"value\": \"3\",\
},\
{ \
	\"name\": \"beat4\", \"type\":\"Label\",\
	\"x\":.1 + ((1.10  * whRatio) / 16) * 12, \"y\": .36,\
	\"width\":(1.10  * whRatio) / 16, \"height\":.045,\
	\"value\": \"4\",\
},\
\
{\
    \"name\": \"start\",\
    \"type\": \"Button\",\
    \"x\": .85, \"y\": .65,\
    \"width\": .145, \"height\": .1,\
    \"startingValue\": 0,\
    \"isLocal\": true,\
    \"mode\": \"toggle\",\
    \"ontouchstart\": \"if(this.value == this.max) { window.run(); } else { window.stop(); }\",\
	\"color\" : \"#666\",\
    \"stroke\": \"#999\",\
},\
{\
    \"name\": \"startLabel\",\
    \"type\": \"Label\",\
    \"x\": .85, \"y\": .65,\
    \"width\": .145, \"height\": .1,\
	\"value\": \"run\",\
},\
\
{\
	\"name\": \"nextPage\",\
	\"type\": \"Button\",\
	\"mode\": \"momentary\",\
	\"stroke\": \"#999\",\
	\"bounds\": [.92, 0, .07, .125],\
	\"isLocal\":true,\
	\"color\": \"#666\",	\
	\"ontouchstart\":\"if(control.currentPage != 7) { control.changePage(\'next\'); pageLabel.setValue(\'CC: \' + (10 + control.currentPage)); }\"\
},\
{\
	\"name\": \"nextPageLabel\",\
	\"type\": \"Label\",\
	\"mode\": \"momentary\",\
	\"bounds\": [.92, 0, .07, .125],\
	\"value\": \"+\",\
	\"size\": 18,\
},\
\
{\
	\"name\": \"previousPage\",\
	\"type\": \"Button\",\
	\"mode\": \"momentary\",\
	\"stroke\": \"#999\",\
	\"bounds\": [.85, 0, .07, .125],\
	\"isLocal\":true,\
	\"color\": \"#666\",\
	\"ontouchstart\":\"control.changePage(\'previous\'); pageLabel.setValue(\'CC: \' + (10 + control.currentPage));\"\
},\
{\
	\"name\": \"previousPageLabel\",\
	\"type\": \"Label\",\
	\"mode\": \"momentary\",\
	\"bounds\": [.85, 0, .07, .125],\
	\"value\": \"-\",\
	\"size\": 18,\
},\
\
{ \
	\"name\": \"pageLabel\", \"type\":\"Label\",\
	\"x\":.85, \"y\": .15,\
	\"width\": .14, \"height\": .025,\
	\"value\": \"CC: 10\",\
	\"align\": \"center\",\
},\
\
{\
	\"name\": \"tempoSlider\",\
	\"type\": \"Slider\",\
	\"x\": .85, \"y\": .23,\
	\"width\": .145, \"height\": .39,\
	\"isLocal\": true,\
	\"min\": 60, \"max\": 200,\
	\"midiMin\":60, \"midiMax\":200,\
	\"requiresTouchDown\": true,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"isVertical\": true,\
	\"ontouchstart\": \"window.setTempo(Math.round(this.value)); tempoLabel.setValue(\'BPM: \' + Math.round(this.value));\",\
	\"ontouchmove\" : \"window.setTempo(Math.round(this.value)); tempoLabel.setValue(\'BPM: \' + Math.round(this.value));\",\
	\"oninit\": \"window.tempoSlider.setValue(120)\",\
},\
\
{ \
	\"name\": \"tempoLabel\", \"type\":\"Label\",\
	\"x\":.85, \"y\": .575,\
	\"width\": .145, \"height\": .025,\
	\"value\": \"BPM: 120\",\
	\"color\": \"#ddd\",\
	\"align\": \"center\",\
},\
\
];\
\
pages = [ \
\
[{\
	\"name\": \"sliders0\",\
	\"type\": \"MultiSlider\",\
	\"x\": .1, \"y\":.0,\
	\"width\": 1.10  * whRatio, \"height\": .325,\
	\"numberOfSliders\": 16,\
	\"requiresTouchDown\": true,\
	\"oninit\": \"control.setSliderNumbers(window.sliders0, 10);\",\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"min\":0, \"max\":127,\
	\"midiStartingValue\": 100,\
	\"startingValue\": 100,	\
}],\
[{\
	\"name\": \"sliders1\",\
	\"type\": \"MultiSlider\",\
	\"x\": .1, \"y\":.0,\
	\"width\": 1.10  * whRatio, \"height\": .325,\
	\"numberOfSliders\": 16,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"requiresTouchDown\": true,\
	\"oninit\": \"control.setSliderNumbers(window.sliders1, 11);\",\
	\"stroke\": \"#aaa\",\
	\"min\":0, \"max\":127,\
	\"midiStartingValue\": 100,\
	\"startingValue\": 100,	\
}],\
[{\
	\"name\": \"sliders2\",\
	\"type\": \"MultiSlider\",\
	\"x\": .1, \"y\":.0,\
	\"width\": 1.10  * whRatio, \"height\": .325,\
	\"numberOfSliders\": 16,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"requiresTouchDown\": true,\
	\"oninit\": \"control.setSliderNumbers(window.sliders2, 12);\",\
	\"stroke\": \"#aaa\",\
	\"min\":0, \"max\":127,\
	\"midiStartingValue\": 100,\
	\"startingValue\": 100,\
}],\
[{\
	\"name\": \"sliders3\",\
	\"type\": \"MultiSlider\",\
	\"x\": .1, \"y\":.0,\
	\"width\": 1.10  * whRatio, \"height\": .325,\
	\"numberOfSliders\": 16,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"requiresTouchDown\": true,\
	\"oninit\": \"control.setSliderNumbers(window.sliders3, 13);\",\
	\"stroke\": \"#aaa\",\
	\"min\":0, \"max\":127,\
	\"midiStartingValue\": 100,\
	\"startingValue\": 100,	\
}],\
[{\
	\"name\": \"sliders4\",\
	\"type\": \"MultiSlider\",\
	\"x\": .1, \"y\":.0,\
	\"width\": 1.10  * whRatio, \"height\": .325,\
	\"numberOfSliders\": 16,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"requiresTouchDown\": true,\
	\"oninit\": \"control.setSliderNumbers(window.sliders4, 14);\",\
	\"stroke\": \"#aaa\",\
	\"min\":0, \"max\":127,\
	\"midiStartingValue\": 100,\
	\"startingValue\": 100,		\
}],\
[{\
	\"name\": \"sliders5\",\
	\"type\": \"MultiSlider\",\
	\"x\": .1, \"y\":.0,\
	\"width\": 1.10  * whRatio, \"height\": .325,\
	\"numberOfSliders\": 16,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"requiresTouchDown\": true,\
	\"oninit\": \"control.setSliderNumbers(window.sliders5, 15);\",\
	\"stroke\": \"#aaa\",\
	\"min\":0, \"max\":127,\
	\"midiStartingValue\": 100,\
	\"startingValue\": 100,	\
}],\
[{\
	\"name\": \"sliders6\",\
	\"type\": \"MultiSlider\",\
	\"x\": .1, \"y\":.0,\
	\"width\": 1.10  * whRatio, \"height\": .325,\
	\"numberOfSliders\": 16,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"requiresTouchDown\": true,\
	\"oninit\": \"control.setSliderNumbers(window.sliders6, 16);\",\
	\"stroke\": \"#aaa\",\
	\"min\":0, \"max\":127,\
	\"midiStartingValue\": 100,\
	\"startingValue\": 100,	\
}],\
[{\
	\"name\": \"sliders7\",\
	\"type\": \"MultiSlider\",\
	\"x\": .1, \"y\":.0,\
	\"width\": 1.10  * whRatio, \"height\": .325,\
	\"numberOfSliders\": 16,\
	\"stroke\": \"#999\",\
	\"color\": \"#666\",\
	\"requiresTouchDown\": true,\
	\"oninit\": \"control.setSliderNumbers(window.sliders7, 17);\",\
	\"min\":0, \"max\":127,\
	\"midiStartingValue\": 100,\
	\"startingValue\": 100,	\
}],\
[\
{\
    \"name\": \"infoText\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .0,\
    \"width\": 1,\
    \"height\": 1,\
    \"value\": infoText,\
    \"verticalCenter\": false,\
    \"align\": \"left\",\
	\"backgroundColor\":\"#000\",	\
},\
{\
    \"name\": \"backButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .85,\
    \"y\": .8,\
    \"width\": .145, \"height\": .095,\
    \"color\": \"#fff\",\
    \"value\": \"back\",\
	\"oninit\":\"window.backButtonLabel.label.style.zIndex =  101;\",\
},\
\
{\
    \"name\": \"backButton\",\
    \"type\": \"Button\",\
    \"x\": .85,\
    \"y\": .8,\
    \"width\": .145, \"height\": .095,\
    \"mode\": \"contact\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#aaaaaa\",\
    \"isLocal\": true,\
    \"ontouchend\": \"control.changePage(0);\",\
	\"oninit\":\"window.backButton.fillDiv.style.zIndex = 100;\",\
},\
\
\
] ];";