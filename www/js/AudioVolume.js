function AudioVolume(props) {
    this.make("sensor", props);
    
    this.mode = (typeof props.mode != "undefined") ? props.mode : "max";
    
    this.volume = 0;
    
    this.hardwareMin = 0;
    this.hardwareMax = 1;
    this.hardwareRange = 1;
    
    if(Control.protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    
    this.userDefinedRange = this.max - this.min;
    
	return this;
}

AudioVolume.prototype = new Widget();

AudioVolume.prototype.start = function() {
    PhoneGap.exec("AudioInput.start", "volume", this.mode);
}	

AudioVolume.prototype.unload = function() {	
    PhoneGap.exec("AudioInput.stop", "volume");
}

AudioVolume.prototype._onVolumeUpdate = function(newVolume) {
    this.volume = this.min + (((0 - this.hardwareMin) + newVolume)  / this.hardwareRange ) * this.userDefinedRange;
    
    //console.log("volume = " + this.volume + " :: newVolume = " + newVolume);
    if(this.onvaluechange != null) {
        eval(this.onvaluechange);
    }
    
    if(!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.volume;
        Control.valuesString += valueString;
    }else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.volume);			
        Control.valuesString += valueString;
    }
}