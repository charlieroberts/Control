function MIDIManager() {
	this.delegate = this;
	PhoneGap.exec("MIDI.start");
	return this;
}

MIDIManager.prototype.processSysExMessage = function(value) {	
	this.delegate.processSysEx(value);
}	

MIDIManager.prototype.processSysEx = function(value) {
	if (typeof control.constants != "undefined") {
    for (var i = 0; i < control.constants.length; i++) {
      var w = control.constants[i];
		  if (w.midiType == "sysex") {
        w.setValue(value, false); // "value" is an array of ints
        break;
      }
    }
  }
	for (var i = 0; i < control.widgets.length; i++) {
		var w = control.widgets[i];
    if (w.midiType == "sysex") {
      w.setValue(value, false); // "value" is an array of ints
      break;
    }
  }
}

MIDIManager.prototype.processMIDIMessage = function(msgType, channel, number, value) {	
	this.delegate.processMIDI(msgType, channel, number, value);
}	

MIDIManager.prototype.processMIDI = function(midiType, midiChannel, midiNumber, value) {
	if(typeof control.constants != "undefined") {
		for(var i = 0; i < control.constants.length; i++) {
			var w = control.constants[i];
			if(w.midiType == midiType && w.channel == midiChannel && w.midiNumber == midiNumber) {
				w.setValue(value, false);
				break;
			}else{
				if(w.widgetType == "MultiButton" || w.widgetType == "MultiSlider") { // TODO: optimize so that it looks at address - last digit
					for(var j = 0; j < w.children.length; j++) {
						var child = w.children[j];
						if(child.midiType == midiType && child.channel == midiChannel && child.midiNumber == midiNumber) {
							child.setValue(value, false);
							return;
						}
					}
				}// TODO: MultiTouchXY
			}	
		}
	}
	for(var i = 0; i < control.widgets.length; i++) {
		var w = control.widgets[i];
		if(w.midiType == midiType && w.channel == midiChannel && w.midiNumber == midiNumber) { // TODO: optimize so that it looks at address - last digit
			w.setValue(value, false);
			break;
		}else{
			if(w.widgetType == "MultiButton" || w.widgetType == "MultiSlider") {
				for(var j = 0; j < w.children.length; j++) {
					var child = w.children[j];
					if(child.midiType == midiType && child.channel == midiChannel && child.midiNumber == midiNumber) {
						child.setValue(value, false);
						return;
					}
				}
			}// TODO: MultiTouchXY 
		}
	}
}

MIDIManager.prototype.sendMIDI = function(msgType, channel, number, value) {    
	if(_protocol == "MIDI") {
		if(typeof value != "undefined") { // -1 means the value was undefined, ie for a program change message
			PhoneGap.exec('MIDI.send', msgType, channel, number, value);
		}else{
			PhoneGap.exec('MIDI.send', msgType, JSON.stringify(channel), number);
		}
	}
}
