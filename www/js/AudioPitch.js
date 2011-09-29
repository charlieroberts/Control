function AudioPitch(props) {
    this.make("sensor", props);
    this.mode = (typeof props.mode != "undefined") ? props.mode : "hps";
    
    this.octave = 0;
    this.number = 21;
    this.noteName = "A0";
    this.freq = 0;
    
    this.hardwareMin = 0;
    this.hardwareMax = 127;
    this.hardwareRange = 127;
    
    if(_protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    
    this.userDefinedRange = this.max - this.min;
    
    this.pitch = 0;
    
    this.noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"]; // 13
    
	return this;
}

AudioPitch.prototype = new Widget();

AudioPitch.prototype.start = function() {	
    PhoneGap.exec("AudioInput.start", "pitch", this.mode);
}	

AudioPitch.prototype.stop = function() {	
    PhoneGap.exec("AudioInput.stop", "pitch");
}

AudioPitch.prototype._onPitchUpdate = function(newFreq) {
    this.freq = newFreq;
    this.pitch = Math.floor(69 + 12 * Math.log(newFreq / 440) / Math.log(2));
    this.octave = Math.round(this.pitch / 12) - 2;
    this.number = Math.round(this.pitch % 12) + 1;
    this.noteName = this.noteNames[this.number] + this.octave;
    
//    console.log("PITCH NAME = " + this.pitch);
    
    if(this.onvaluechange != null) {
        eval(this.onvaluechange);
    }
    
    if(!this.isLocal && _protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.pitch;
        control.valuesString += valueString;
    }else if (!this.isLocal && _protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.pitch);			
        control.valuesString += valueString;
    }
}