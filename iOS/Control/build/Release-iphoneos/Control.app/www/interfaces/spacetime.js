interfaceString = "loadedInterfaceName = \"Space-Time Keyboard\";\
\
interfaceOrientation = \"landscape\";\
\
infoText = \"The Pellegrini Space-Time Keyboard was created by Roger Pellegrini (http://www.pellegriniusa.com/). It emulates the behavior of a Haken Continuum, where pitch is not discrete. The interface is MIDI only, and primarily works by sending noteon, noteoff and pitchbend information. When you first strike a key a noteon is sent; moving your finger along the x-axis at this point will yield pitchbends. You can set the message sent by the y-axis using the provided slider and also set the velocity that noteons are triggered with. It is recommended that whatever synth you are controlling be set to a pitchbend range of -1/+1 octaves.\";\
\
\
keys = new Array();\
keysBend = new Array();\
\
keysColor = new Array();\
keysColor = [\"#fff\",\"#333\",\"#fff\",\"#333\",\"#fff\",\"#fff\",\"#333\",\"#fff\",\"#333\",\"#fff\",\"#333\",\"#fff\",\"#fff\",\"#333\",\"#fff\",\"#333\",\"#fff\",\"#fff\",\"#333\",\"#fff\",\"#333\",\"#fff\",\"#333\",\"#fff\",\"#fff\"];\
\
keysOnColor = new Array();\
keysOnColor = [\"#fbb\",\"#733\",\"#fbb\",\"#733\",\"#fbb\",\"#fbb\",\"#733\",\"#fbb\",\"#733\",\"#fbb\",\"#733\",\"#fbb\",\"#fbb\",\"#733\",\"#fbb\",\"#733\",\"#fbb\",\"#fbb\",\"#733\",\"#fbb\",\"#733\",\"#fbb\",\"#733\",\"#fbb\",\"#fbb\"];\
\
keysLeft = .044271;\
keysWidth = 0.875 / 24;\
currentBend = 0;\
currentY =0;\
currentKey = 0;\
originalKey = 0;\
previousBend = 0;\
previousY =0;\
previousKey = 0;\
LSB = 0;\
MSB = 0;\
numKeys = 25;\
midichannel = 1;\
ccchannel = 1;\
velocity = 100;\
keynumber = 60;\
childwidth = 1;\
childheight = 1;\
\
function keynum(percentage) {\
	return Math.round((numKeys-1)*percentage);\
}\
window.keynum = keynum;\
\
function changemidichannel(chan) {\
	midichannel = parseInt(chan);\
	midichannelLabel.label.innerHTML = parseInt(midichannel);\
}\
window.changemidichannel=changemidichannel;\
\
function changeccchannel(chan) {\
	ccchannel = parseInt(chan);\
	ccchannelLabel.label.innerHTML = parseInt(ccchannel);\
}\
window.changeccchannel=changeccchannel;\
\
function changevelocity(chan) {\
	velocity = parseInt(chan);\
	velocityLabel.label.innerHTML = parseInt(velocity);\
}\
window.changevelocity=changevelocity;\
\
function octavedowner () {\
	keynumber = Math.max(keynumber - 12, 12);\
	octaveLabel.label.innerHTML = \"C\" + parseInt(keynumber/12 -2);\
}\
window.octavedowner = octavedowner;\
\
function octaveupper () {\
	keynumber = Math.min(keynumber + 12, 108);\
	octaveLabel.label.innerHTML = \"C\" + parseInt(keynumber/12 -2);\
}\
window.octaveupper = octaveupper;\
\
\
function sendBend(Bend) {\
	LSB = Bend & 127;\
	MSB = Bend >>> 7;\
	midiManager.sendMIDI(\"pitchbend\", midichannel , LSB, MSB);\
}\
window.sendBend = sendBend;\
\
function keyInitHandler () {\
\
	for(i = 0; i < numKeys; i++) \
		{\
		window.keys[i].label.innerHTML = \"\";\
		window.keys[i].label.style.height = window.multi.height + \"px\";\
		window.keys[i].label.style.width = keysWidth * 0.99* window.multi.width + \"px\";\
		window.keys[i].label.style.left = (keysLeft + keysWidth * i)* window.multi.width +\"px\";\
		window.keys[i].label.style.backgroundColor = keysColor[i]; \
		keysBend[i] = parseInt(i * 16383/(numKeys-1));\
		}\
\
	window.multi.children[0].style.display = \"none\";\
	childwidth = parseInt(window.multi.children[0].style.width);\
	childheight = parseInt(window.multi.children[0].style.height);\
}\
window.keyInitHandler = keyInitHandler;\
\
function ontouchstarthandler () {\
\
	loc = (parseInt(window.multi.children[0].style.left) + (childwidth / 2));\
	pct = (loc/window.multi.width - 0.0625)/0.875;\
\
	locY = (parseInt(window.multi.children[0].style.top) + (childheight  / 2));\
	pctY = 1-(locY/window.multi.height - 0.1388286)/0.72234273;\
\
	currentY = Math.round(pctY * 127);\
	currentKey = window.keynum(pct);\
	currentBend = keysBend[currentKey];\
\
	sendBend(currentBend);\
\
	midiManager.sendMIDI(\"noteon\", midichannel, keynumber, velocity);\
	midiManager.sendMIDI(\"cc\", midichannel, ccchannel, currentY);\
\
	originalKey = currentKey;\
	window.keys[originalKey].label.style.backgroundColor = keysOnColor[originalKey]; \
	previousBend = currentBend;\
	previousY = currentY;\
	\
}\
window.ontouchstarthandler = ontouchstarthandler;\
\
function ontouchmovehandler () {\
\
	loc = (parseInt(window.multi.children[0].style.left) + (childwidth/ 2));\
	pct = (loc/window.multi.width - 0.0625)/0.875;\
\
	locY = (parseInt(window.multi.children[0].style.top) + (childheight/ 2));\
	pctY = 1-(locY/window.multi.height - 0.1388286)/0.7223427326;\
\
	currentBend = parseInt(pct * 16383);\
	currentY = Math.round(pctY * 127);\
	currentKey = window.keynum(pct);\
\
	if (Math.abs((currentY-previousY)/127) > Math.abs((currentBend - previousBend)/16384)) {\
		currentBend = keysBend[currentKey];\
	}\
	else\
	{\
	}\
	if (currentBend != previousBend) {\
		sendBend(currentBend);\
	}\
	if (currentY != previousY) {\
		midiManager.sendMIDI(\"cc\", midichannel, ccchannel, currentY);\
	}\
\
	previousBend = currentBend;\
	previousY = currentY;\
	previousKey = currentKey;\
}\
window.ontouchmovehandler = ontouchmovehandler;\
\
function ontouchendhandler () {\
	midiManager.sendMIDI(\"noteoff\", 1, keynumber, 127);\
	window.keys[originalKey].label.style.backgroundColor = keysColor[originalKey]; \
\
}\
window.ontouchendhandler = ontouchendhandler;\
\
pages = [[\
{\
    \"name\": \"multi\",\
    \"type\": \"MultiTouchXY\",\
    \"x\": .0,\
    \"y\": .4,\
    \"width\": 1,\
    \"height\": .6,\
    \"color\": \"rgba(0,0,0,0)\",\
    \"stroke\": \"#aaaaaa\",\
    \"mode\": \"momentary\",\
    \"protocol\": \"MIDI\",\
    \"midiType\": \"cc\",\
    \"midiNumber\": 60,\
    \"maxTouches\": 1,\
    \"isMomentary\": false,\
    \"isLocal\": true,\
    \"requiresTouchDown\": false,\
    \"ontouchstart\": \"window.ontouchstarthandler()\",\
    \"ontouchmove\": \"window.ontouchmovehandler()\",\
    \"ontouchend\": \"window.ontouchendhandler()\",\
\
},\
\
{\
    \"name\": \"info\",\
    \"type\": \"Button\",\
    \"x\": .6, \"y\": 0,\
    \"width\": .2, \"height\": .1,\
    \"startingValue\": 0,\
    \"isLocal\": true,\
    \"mode\": \"contact\",\
    \"ontouchstart\": \"control.changePage(1);\",\
    \"color\": \"rgb(0,0,185)\",\
	\"backgroundColor\": \"rgba(40,40,40,1)\",\
    \"stroke\": \"#aaa\",\
	\"label\":\"info\",\
},\
{\
    \"name\": \"tabButton\",\
    \"type\": \"Button\",\
    \"x\": .8, \"y\": 0,\
    \"width\": .2, \"height\": .1,\
    \"mode\": \"toggle\",\
    \"isLocal\": true,\
    \"ontouchstart\": \"if(this.value == this.max) { control.showToolbar(); } else { control.hideToolbar(); }\",\
\"color\": \"rgb(0,0,185)\",\
	\"backgroundColor\": \"rgba(40,40,40,1)\",\
    \"stroke\": \"#aaa\",\
	\"label\":\"menu\",\
\
},\
{\
    \"name\": \"Key1\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key1);\", \
},\
\
{\
    \"name\": \"Key2\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key2);\", \
},\
{\
    \"name\": \"Key3\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key3);\", \
},\
\
{\
    \"name\": \"Key4\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key4);\", \
},\
{\
    \"name\": \"Key5\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key5);\", \
},\
\
{\
    \"name\": \"Key6\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key6);\", \
},\
{\
    \"name\": \"Key7\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key7);\", \
},\
\
{\
    \"name\": \"Key8\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key8);\", \
},\
{\
    \"name\": \"Key9\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key9);\", \
},\
\
{\
    \"name\": \"Key10\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key10);\", \
},\
{\
    \"name\": \"Key11\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key11);\", \
},\
\
{\
    \"name\": \"Key12\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key12);\", \
},\
{\
    \"name\": \"Key13\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key13);\", \
},\
\
{\
    \"name\": \"Key14\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key14);\", \
},\
{\
    \"name\": \"Key15\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key15);\", \
},\
\
{\
    \"name\": \"Key16\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key16);\", \
},\
{\
    \"name\": \"Key17\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key17);\", \
},\
\
{\
    \"name\": \"Key18\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key18);\", \
},\
{\
    \"name\": \"Key19\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key19);\", \
},\
\
{\
    \"name\": \"Key20\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key20);\", \
},\
{\
    \"name\": \"Key21\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key21);\", \
},\
\
{\
    \"name\": \"Key22\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key22);\", \
},\
{\
    \"name\": \"Key23\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key23);\", \
},\
\
{\
    \"name\": \"Key24\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key24);\", \
},\
{\
    \"name\": \"Key25\",\
    \"type\": \"Label\",\
    \"y\": .4,\
    \"isLocal\": true,\
	\"oninit\": \"window.keys.push(window.Key25);\", \
},\
{ 	\
	\"name\":\"logo1\", \
	\"type\":\"Label\", \
    	\"x\":0.6, \"y\":0.1,\
    	\"width\":.4, \"height\":.15,\
    \"verticalCenter\": false,\
	\"isLocal\": true,\
	\"value\":\"pellegrini space-time keyboard\", \
	\"size\":18,\
	\"backgroundColor\": \"rgba(0,0,185,1)\",\
	\"color\": \"rgb(0,0,0)\",\
},\
{\
    \"name\":\"midichannelSlider\",\
    \"type\":\"Slider\",\
    \"x\":0.01, \"y\":0.09,\
	\"min\" : 1, \"max\" : 17,\
    \"width\":.35, \"height\":.075,\
	\"isLocal\": true,\
	\"color\": \"rgb(0,0,185)\",\
	\"backgroundColor\": \"rgba(40,40,40,1)\",\
    \"startingValue\": 1,\
	\"onvaluechange\" : \"window.changemidichannel(this.value);\",\
},\
{\
    \"name\": \"midichannelLabel\",\
    \"type\": \"Label\",\
    \"x\": .37, \"y\": .09,\
    \"width\": .03, \"height\": .05,\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"value\": 1,\
},\
\
{\
    \"name\": \"midichannelLabel2\",\
    \"type\": \"Label\",\
    \"x\": .42, \"y\": .09,\
    \"width\": .175, \"height\": .05,\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"align\": \"left\",\
    \"value\": \"midi channel\",\
},\
{\
    \"name\":\"ccchannelSlider\",\
    \"type\":\"Slider\",\
    \"x\":0.01, \"y\":0.17,\
	\"min\" : 0, \"max\" : 127,\
    \"width\":.35, \"height\":.075,\
	\"isLocal\": true,\
	\"color\": \"rgb(0,0,185)\",\
	\"backgroundColor\": \"rgba(40,40,40,1)\",\
    \"startingValue\": 1,\
	\"onvaluechange\" : \"window.changeccchannel(this.value);\",\
},\
{\
    \"name\": \"ccchannelLabel\",\
    \"type\": \"Label\",\
    \"x\": .37, \"y\": .17,\
    \"width\": .03, \"height\": .05,\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"value\": 1,\
},\
\
{\
    \"name\": \"ccchannelLabel2\",\
    \"type\": \"Label\",\
    \"x\": .42, \"y\": .17,\
    \"width\": .175, \"height\": .05,\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"align\": \"left\",\
    \"value\": \"y-axis cc #\",\
},\
{\
    \"name\":\"velocitySlider\",\
    \"type\":\"Slider\",\
    \"x\":0.01, \"y\":0.25,\
	\"min\" : 0, \"max\" : 127,\
    \"width\":.35, \"height\":.075,\
	\"isLocal\": true,\
	\"color\": \"rgb(0,0,185)\",\
	\"backgroundColor\": \"rgba(40,40,40,1)\",\
    \"startingValue\": 100,\
	\"onvaluechange\" : \"window.changevelocity(this.value);\",\
},\
{\
    \"name\": \"velocityLabel\",\
    \"type\": \"Label\",\
    \"x\": .37, \"y\": .25,\
    \"width\": .03, \"height\": .05,\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"value\": 100,\
},\
\
{\
    \"name\": \"velocityLabel2\",\
    \"type\": \"Label\",\
    \"x\": .42, \"y\": .25,\
    \"width\": .175, \"height\": .05,\
    \"align\": \"left\",\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"value\": \"velocity\",\
},\
{\
    \"name\": \"octaveLabel\",\
    \"type\": \"Label\",\
    \"x\": .475, \"y\": .33,\
    \"width\": .05, \"height\": .05,\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"value\": \"C3\",\
},\
{\
    \"name\": \"octavedown\",\
    \"type\": \"Button\",\
    \"x\": .4, \"y\": 0.33,\
    \"width\": .065, \"height\": .065,\
    \"startingValue\": 0,\
    \"isLocal\": true,\
    \"mode\": \"contact\",\
	\"color\": \"rgb(0,0,185)\",\
	\"backgroundColor\": \"rgba(40,40,40,1)\",\
    \"stroke\": \"#aaa\",\
	\"labelSize\": 18,\
	\"label\": \"-1\",\
    \"ontouchstart\": \"window.octavedowner();\",\
},\
{\
    \"name\": \"octaveup\",\
    \"type\": \"Button\",\
    \"x\": .55, \"y\": 0.33,\
    \"width\": .065, \"height\": .065,\
    \"startingValue\": 0,\
    \"isLocal\": true,\
    \"mode\": \"contact\",\
	\"color\": \"rgb(0,0,185)\",\
	\"backgroundColor\": \"rgba(40,40,40,1)\",\
    \"stroke\": \"#aaa\",\
	\"labelSize\": 18,\
	\"label\": \"+1\",\
    \"ontouchstart\": \"window.octaveupper();\",\
	\"oninit\": \"window.keyInitHandler();\",\
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
\"isLocal\": true,\
\"ontouchstart\": \"control.changePage(0);window.multi.children[0].style.display='none';\",\
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