function AudioInput(props) {
    this.make("sensor", props);
    
    this.mode = (typeof props.mode != "undefined") ? props.mode : "max";
    this.volume = 0;
    
    this.hardwareMin = 0;

    if(this.mode != "pitch") {
        this.hardwareMax = 1;
        this.hardwareRange = 1;
    }else{
        this.hardwareMax = 127;
        this.hardwareRange = 127;
    }
    
    if(_protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    
    this.userDefinedRange = this.max - this.min;
    this.pitch = 0;

	return this;
}

AudioInput.prototype = new Widget();

AudioInput.prototype.start = function() {	
    PhoneGap.exec("AudioInput.start", this.mode, this.shouldOutputPitch);
}	

AudioInput.prototype.stop = function() {	
    PhoneGap.exec("AudioInput.stop");
}

AudioInput.prototype._onVolumeUpdate = function(newVolume) {
    this.volume = this.min + (((0 - this.hardwareMin) + newVolume)  / this.hardwareRange ) * this.userDefinedRange;
    
    //console.log("volume = " + this.volume + " :: newVolume = " + newVolume);
    if(this.onvaluechange != null) {
        eval(this.onvaluechange);
    }
    
    if(!this.isLocal && _protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.volume;
        control.valuesString += valueString;
    }else if (!this.isLocal && _protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.volume);			
        control.valuesString += valueString;
    }
}

AudioInput.prototype._onPitchUpdate = function(newPitch) {
    this.pitch = Math.floor(69 + 12 * Math.log(newPitch / 440) / Math.log(2));
    console.log("PITCH NUMBER = " + this.pitch);

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