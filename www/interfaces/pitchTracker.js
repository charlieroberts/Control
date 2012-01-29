interfaceString = "loadedInterfaceName = \"Pitch Tracker\";\
\
interfaceOrientation = \"portrait\";\
\
control.storedNote = 0;\
control.storedNote2 = 0;\
control.storedNote3 = 0;\
\
infoText = \"This interface tracks pitch entering the microphone using a technique called Harmonic Product Spectrum. The buttons allow noteon / noteoff capabilities for up to three notes at a time. This interface only sends pitch as MIDI numbers but can be easily modified to send frequencies via OSC.<br><br>Make sure you have a MIDI destination selected when using this interface.\";\
\
pages = [[\
{\
\"name\": \"playNote\", \
\"type\": \"Button\", \
\"bounds\": [.0, .0, 1, .25], \
\"isLocal\": true,\
\"label\": \"TRIGGER NOTE\", \
\"mode\": \"momentary\", \
\"ontouchstart\": \"midiManager.sendMIDI('noteon', 1, window.audioP.pitch, 127); control.storedNote = audioP.pitch;\", \
\"ontouchend\": \"midiManager.sendMIDI('noteon', 1, control.storedNote, 0);\",     \
},\
{\
\"name\": \"playNote2\", \
\"type\": \"Button\", \
\"bounds\": [.0, .25, 1, .25], \
\"isLocal\": true,\
\"label\": \"TRIGGER NOTE 2 \", \
\"mode\": \"momentary\", \
\"ontouchstart\": \"midiManager.sendMIDI('noteon', 1, window.audioP.pitch, 127); control.storedNote2 = audioP.pitch;\", \
\"ontouchend\": \"midiManager.sendMIDI('noteon', 1, control.storedNote2, 0);\",     \
},\
{\
\"name\": \"playNote3\", \
\"type\": \"Button\", \
\"bounds\": [.0, .5, 1, .25], \
\"isLocal\": true,\
\"label\": \"TRIGGER NOTE 3 \", \
\"mode\": \"momentary\", \
\"ontouchstart\": \"midiManager.sendMIDI('noteon', 1, window.audioP.pitch, 127); control.storedNote3 = audioP.pitch;\", \
\"ontouchend\": \"midiManager.sendMIDI('noteon', 1, control.storedNote3, 0);\",     \
},\
{\
\"name\": \"pitchLabel\", \
\"type\": \"Label\",\
\"bounds\": [0,.8,.3,.1],\
\"value\": \"pitch\",\
\"oninit\": \"window.pitchLabel.label.style.textWrap = 'none';\", \
\"size\": 48,\
},\
{\
\"name\": \"info\", \
\"type\": \"Button\", \
\"bounds\": [.6, .8, .2, .1],\
\"isLocal\": true,\
\"label\": \"info\", \
\"mode\": \"contact\",\
\"stroke\": \"#aaa\",\
\"ontouchstart\": \"control.changePage('next');\"\
},\
\
{\
\"name\": \"tabButton\",\
\"type\": \"Button\",\
\"bounds\": [.8, .8, .2, .1],\
\"mode\": \"toggle\",\
\"stroke\": \"#aaa\",\
\"isLocal\": true,\
\"ontouchstart\": \"if(this.value == this.max) { control.showToolbar(); } else { control.hideToolbar(); }\",\
\"label\": \"menu\",\
},\
{\
\"name\": \"audioP\",\
\"type\": \"AudioPitch\",\
\"mode\": \"hps\",\
\"isLocal\": true,\
\"onvaluechange\": \"pitchLabel.setValue(this.noteName)\", \
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
],\
\
];";